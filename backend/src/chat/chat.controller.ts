import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('tickets')
  async getTickets(@Req() req: any) {
    return this.chatService.getTickets(req.user.userId);
  }

  @Get('tickets/:id/messages')
  async getMessages(@Param('id') ticketId: string, @Req() req: any) {
    return this.chatService.getMessages(ticketId, req.user.userId);
  }

  @Post('tickets/:id/send')
  async sendMessage(
    @Param('id') ticketId: string,
    @Body('body') body: string,
    @Req() req: any,
  ) {
    return this.chatService.sendMessage(ticketId, req.user.userId, body);
  }

  @Post('tickets/:id/status')
  async updateStatus(
    @Param('id') ticketId: string,
    @Body('status') status: string,
    @Req() req: any,
  ) {
    return this.chatService.updateTicketStatus(ticketId, req.user.userId, status);
  }
}
