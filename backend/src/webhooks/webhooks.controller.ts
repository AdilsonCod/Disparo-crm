import { Controller, Post, Body, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private prisma: PrismaService) {}

  @Post('evolution')
  async handleEvolutionWebhook(@Body() body: any, @Req() req: any) {
    // A Evolution API envia o evento no body.event e a instancia em body.instance
    const { event, data, instance } = body;

    console.log(`Received webhook from Evolution API: ${event} for instance ${instance}`);

    if (event === 'CONNECTION_UPDATE') {
      const state = data?.state;
      if (state) {
        await this.prisma.instance.updateMany({
          where: { evolutionInstanceName: instance },
          data: { status: state }, // e.g. open, connecting, close
        });
      }
    }

    if (event === 'MESSAGES_UPDATE') {
      // Exemplo de atualizacao de status da mensagem (Entregue/Lido)
      console.log('Message updated:', data);
    }

    if (event === 'MESSAGES_UPSERT') {
      try {
        const messageData = data.message;
        if (!messageData) return { status: 'ok' };

        const remoteJid = messageData.key.remoteJid;
        const fromMe = messageData.key.fromMe;
        
        // Ignore status broadcasts
        if (remoteJid === 'status@broadcast') return { status: 'ok' };

        // Extract phone number from JID (e.g., 5511999999999@s.whatsapp.net -> 5511999999999)
        const phone = remoteJid.split('@')[0];

        // Get text content (it can be in conversation or extendedTextMessage)
        const body = messageData.message?.conversation || messageData.message?.extendedTextMessage?.text || '';
        if (!body && !messageData.message?.imageMessage && !messageData.message?.audioMessage) {
          return { status: 'ok' };
        }

        const type = messageData.message?.imageMessage ? 'image' : messageData.message?.audioMessage ? 'audio' : 'text';

        // Find the instance
        const inst = await this.prisma.instance.findUnique({
          where: { evolutionInstanceName: instance },
        });

        if (!inst) return { status: 'ok' };

        // Find or create Contact
        // Need to find existing contact by phone AND userId from instance
        let contact = await this.prisma.contact.findUnique({
          where: { phone_userId: { phone, userId: inst.userId } },
        });

        if (!contact) {
          contact = await this.prisma.contact.create({
            data: {
              phone,
              name: messageData.pushName || phone,
              userId: inst.userId,
            },
          });
        }

        // Find or create Ticket
        let ticket = await this.prisma.ticket.findFirst({
          where: { contactId: contact.id, instanceId: inst.id },
        });

        if (!ticket) {
          ticket = await this.prisma.ticket.create({
            data: {
              contactId: contact.id,
              instanceId: inst.id,
              status: 'OPEN',
            },
          });
        }

        // Create Message
        await this.prisma.message.create({
          data: {
            ticketId: ticket.id,
            body: body || '[Mídia]',
            fromMe,
            type,
          },
        });

        // Update ticket timestamp
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { updatedAt: new Date() },
        });

      } catch (err) {
        console.error('Error handling MESSAGES_UPSERT:', err);
      }
    }

    return { status: 'ok' };
  }
}
