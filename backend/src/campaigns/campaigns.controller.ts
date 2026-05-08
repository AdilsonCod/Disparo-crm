import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CampaignsService, CreateCampaignDto } from './campaigns.service';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.campaignsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.campaignsService.findOne(id, req.user.userId);
  }

  @Post()
  create(@Body() body: CreateCampaignDto, @Req() req: any) {
    return this.campaignsService.create(body, req.user.userId);
  }

  @Post(':id/start')
  start(@Param('id') id: string, @Req() req: any) {
    return this.campaignsService.start(id, req.user.userId);
  }

  @Post(':id/pause')
  pause(@Param('id') id: string, @Req() req: any) {
    return this.campaignsService.pause(id, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.campaignsService.delete(id, req.user.userId);
  }
}
