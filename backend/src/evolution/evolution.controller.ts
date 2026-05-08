import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { EvolutionService } from './evolution.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('evolution')
@UseGuards(JwtAuthGuard)
export class EvolutionController {
  constructor(
    private readonly evolutionService: EvolutionService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('create-instance')
  async createInstance(@Body() body: { name: string }, @Request() req: any) {
    const userId = req.user.userId;
    // Evitar colisões de nome usando timestamp ou ID do usuario
    const evolutionInstanceName = `${body.name.replace(/\s+/g, '')}_${Date.now()}`;
    
    // Configura o Webhook (vamos usar um webhook padrao para a nossa API no futuro)
    const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/webhooks/evolution';
    
    // Chama a Evolution API
    const response = await this.evolutionService.createInstance(evolutionInstanceName, webhookUrl);

    // Salva no banco
    const instance = await this.prisma.instance.create({
      data: {
        name: body.name,
        evolutionInstanceName: evolutionInstanceName,
        userId: userId,
        status: 'CONNECTING',
        qrCode: response.qrcode?.base64,
      }
    });

    return { instance, evolutionResponse: response };
  }

  @Get('instances')
  async listInstances(@Request() req: any) {
    const userId = req.user.userId;
    return this.prisma.instance.findMany({
      where: { userId }
    });
  }
}
