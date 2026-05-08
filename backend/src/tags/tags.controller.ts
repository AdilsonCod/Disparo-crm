import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TagsService } from './tags.service';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.tagsService.findAll(req.user.userId);
  }

  @Post()
  create(@Body() body: { name: string; color?: string }, @Req() req: any) {
    return this.tagsService.create(body, req.user.userId);
  }

  @Post(':tagId/contact/:contactId')
  addToContact(@Param('tagId') tagId: string, @Param('contactId') contactId: string) {
    return this.tagsService.addToContact(tagId, contactId);
  }

  @Delete(':tagId/contact/:contactId')
  removeFromContact(@Param('tagId') tagId: string, @Param('contactId') contactId: string) {
    return this.tagsService.removeFromContact(tagId, contactId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tagsService.delete(id, req.user.userId);
  }
}
