import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
  ],
  providers: [ContactsService],
  controllers: [ContactsController],
  exports: [ContactsService],
})
export class ContactsModule {}
