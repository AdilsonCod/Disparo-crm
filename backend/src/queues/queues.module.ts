import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CampaignProcessor } from './campaign.processor';
import { EvolutionModule } from '../evolution/evolution.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'campaigns' }),
    EvolutionModule,
  ],
  providers: [CampaignProcessor],
})
export class QueuesModule {}
