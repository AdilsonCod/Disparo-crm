import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EvolutionModule } from './evolution/evolution.module';
import { QueuesModule } from './queues/queues.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { BullModule } from '@nestjs/bullmq';
import { ContactsModule } from './contacts/contacts.module';
import { TagsModule } from './tags/tags.module';
import { CampaignsModule } from './campaigns/campaigns.module';

import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || '',
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    EvolutionModule,
    QueuesModule,
    WebhooksModule,
    ContactsModule,
    TagsModule,
    CampaignsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
