import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EvolutionService } from '../evolution/evolution.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private evolution: EvolutionService,
  ) {}

  async getTickets(userId: string) {
    // Only return tickets for contacts owned by this user
    return this.prisma.ticket.findMany({
      where: {
        contact: {
          userId,
        },
      },
      include: {
        contact: true,
        instance: true,
        assignedUser: {
          select: { id: true, name: true },
        },
        // get the latest message
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getMessages(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        contact: { userId },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.prisma.message.findMany({
      where: { ticketId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async sendMessage(ticketId: string, userId: string, body: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, contact: { userId } },
      include: { contact: true, instance: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Call Evolution API
    // Evolution API expects standard E.164 without '+' or standard local depending on provider.
    // Ensure instance is connected
    if (ticket.instance.status !== 'open') {
      throw new Error('Instance is not connected');
    }

    await this.evolution.sendText(ticket.instance.evolutionInstanceName, ticket.contact.phone, body);

    // Save message locally
    const message = await this.prisma.message.create({
      data: {
        ticketId,
        body,
        fromMe: true,
        type: 'text',
      },
    });

    // Update ticket timestamp
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async updateTicketStatus(ticketId: string, userId: string, status: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, contact: { userId } },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });
  }
}
