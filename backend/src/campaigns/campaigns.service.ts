import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export class CreateCampaignDto {
  name: string;
  message: string;
  instanceId: string;
  tagIds: string[];
  useSpintax?: boolean;
  mediaUrl?: string;
  mediaType?: string;
  scheduledAt?: string;
  minDelay?: number;
  maxDelay?: number;
  pauseStart?: string;
  pauseEnd?: string;
}

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('campaigns') private campaignsQueue: Queue,
  ) {}

  async findAll(userId: string) {
    return this.prisma.campaign.findMany({
      where: { userId },
      include: {
        instance: { select: { id: true, name: true, status: true } },
        tags: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        instance: true,
        tags: true,
      },
    });
    if (!campaign) throw new NotFoundException('Campanha não encontrada');
    if (campaign.userId !== userId) throw new ForbiddenException();
    return campaign;
  }

  async create(data: CreateCampaignDto, userId: string) {
    // Count contacts matching selected tags
    const contactCount = await this.prisma.contact.count({
      where: {
        userId,
        tags: { some: { id: { in: data.tagIds } } },
      },
    });

    return this.prisma.campaign.create({
      data: {
        name: data.name,
        message: data.message,
        useSpintax: data.useSpintax ?? false,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        minDelay: data.minDelay ?? 15,
        maxDelay: data.maxDelay ?? 35,
        pauseStart: data.pauseStart,
        pauseEnd: data.pauseEnd,
        totalContacts: contactCount,
        instance: { connect: { id: data.instanceId } },
        user: { connect: { id: userId } },
        tags: { connect: data.tagIds.map((id) => ({ id })) },
      },
      include: { instance: true, tags: true },
    });
  }

  async start(id: string, userId: string) {
    const campaign = await this.findOne(id, userId);
    if (!['DRAFT', 'PAUSED'].includes(campaign.status)) {
      throw new ForbiddenException(`Campanha com status "${campaign.status}" não pode ser iniciada`);
    }

    // Fetch contacts matching the campaign tags
    const contacts = await this.prisma.contact.findMany({
      where: {
        userId,
        tags: { some: { id: { in: campaign.tags.map((t) => t.id) } } },
      },
      select: { id: true, phone: true, name: true },
    });

    // Update campaign status
    await this.prisma.campaign.update({
      where: { id },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
        totalContacts: contacts.length,
      },
    });

    // Add job to BullMQ queue
    await this.campaignsQueue.add('process-campaign', {
      campaignId: id,
      instanceName: campaign.instance.evolutionInstanceName,
      message: campaign.message,
      useSpintax: campaign.useSpintax,
      mediaUrl: campaign.mediaUrl,
      mediaType: campaign.mediaType,
      minDelay: campaign.minDelay,
      maxDelay: campaign.maxDelay,
      pauseStart: campaign.pauseStart,
      pauseEnd: campaign.pauseEnd,
      contacts,
    });

    return { message: 'Campanha iniciada', totalContacts: contacts.length };
  }

  async pause(id: string, userId: string) {
    const campaign = await this.findOne(id, userId);
    if (campaign.status !== 'PROCESSING') {
      throw new ForbiddenException('Somente campanhas em processamento podem ser pausadas');
    }
    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.campaign.delete({ where: { id } });
  }
}
