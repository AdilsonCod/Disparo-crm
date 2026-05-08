import {
  Controller, Get, Post, Delete, Param, Req,
  UseGuards, UseInterceptors, UploadedFile, Body, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.contactsService.findAll(req.user.userId);
  }

  @Post()
  create(@Body() body: { phone: string; name?: string; email?: string }, @Req() req: any) {
    return this.contactsService.create(body, req.user.userId);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })], // 10MB
      }),
    )
    file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.contactsService.importFromCsv(file.buffer, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.contactsService.delete(id, req.user.userId);
  }
}
