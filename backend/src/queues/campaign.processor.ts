import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EvolutionService } from '../evolution/evolution.service';

interface CampaignContact {
  id: string;
  phone: string;
  name: string | null;
}

interface CampaignJobData {
  campaignId: string;
  instanceName: string;
  message: string;
  useSpintax: boolean;
  mediaUrl?: string;
  mediaType?: string;
  minDelay: number;
  maxDelay: number;
  pauseStart?: string;
  pauseEnd?: string;
  contacts: CampaignContact[];
}

@Processor('campaigns')
export class CampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignProcessor.name);

  constructor(
    private prisma: PrismaService,
    private evolutionService: EvolutionService,
  ) {
    super();
  }

  async process(job: Job<CampaignJobData>): Promise<void> {
    const {
      campaignId,
      instanceName,
      message,
      useSpintax,
      minDelay,
      maxDelay,
      pauseStart,
      pauseEnd,
      contacts,
    } = job.data;

    this.logger.log(`Iniciando campanha ${campaignId} — ${contacts.length} contatos`);

    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < contacts.length; i++) {
      // Check if campaign was paused
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { status: true },
      });

      if (campaign?.status === 'PAUSED') {
        this.logger.log(`Campanha ${campaignId} pausada pelo usuario`);
        return;
      }

      // Check night pause
      if (pauseStart && pauseEnd && this.isInPauseWindow(pauseStart, pauseEnd)) {
        this.logger.log(`Campanha ${campaignId} em pausa noturna`);
        // Wait 5 minutes and re-check
        await this.sleep(5 * 60 * 1000);
        i--; // retry same contact
        continue;
      }

      const contact = contacts[i];

      // Process Spintax and variables
      let finalMessage = message;
      if (useSpintax) {
        finalMessage = this.processSpintax(finalMessage);
      }
      // Replace dynamic variables
      finalMessage = finalMessage.replace(/\{nome\}/gi, contact.name || '');
      finalMessage = finalMessage.replace(/\{telefone\}/gi, contact.phone || '');

      try {
        await this.evolutionService.sendText(instanceName, contact.phone, finalMessage);
        sentCount++;
        this.logger.log(`[${sentCount}/${contacts.length}] Enviado para ${contact.phone}`);
      } catch (error) {
        failedCount++;
        this.logger.error(`Falha ao enviar para ${contact.phone}: ${error}`);
      }

      // Update stats periodically (every 10 messages)
      if (i % 10 === 0 || i === contacts.length - 1) {
        await this.prisma.campaign.update({
          where: { id: campaignId },
          data: { sentCount, failedCount },
        });
        await job.updateProgress(Math.round(((i + 1) / contacts.length) * 100));
      }

      // Humanized delay between messages (except last one)
      if (i < contacts.length - 1) {
        const delay = this.randomDelay(minDelay, maxDelay);
        await this.sleep(delay * 1000);
      }
    }

    // Mark campaign as completed
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        sentCount,
        failedCount,
      },
    });

    this.logger.log(`Campanha ${campaignId} finalizada — ${sentCount} enviadas, ${failedCount} falhas`);
  }

  /**
   * Spintax processor: {Oi|Olá|Opa} → randomly picks one option
   */
  private processSpintax(text: string): string {
    return text.replace(/\{([^{}]+)\}/g, (_match, group) => {
      // Only process if it looks like spintax (contains pipe)
      if (!group.includes('|')) return `{${group}}`;
      const options = group.split('|');
      return options[Math.floor(Math.random() * options.length)];
    });
  }

  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isInPauseWindow(pauseStart: string, pauseEnd: string): boolean {
    const now = new Date();
    const [ph, pm] = pauseStart.split(':').map(Number);
    const [eh, em] = pauseEnd.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = ph * 60 + pm;
    const endMinutes = eh * 60 + em;

    // Handles overnight windows like 20:00 -> 08:00
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}
