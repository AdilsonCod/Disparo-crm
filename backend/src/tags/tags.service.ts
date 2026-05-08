import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.tag.findMany({
      where: { userId },
      include: { _count: { select: { contacts: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; color?: string }, userId: string) {
    return this.prisma.tag.upsert({
      where: { name_userId: { name: data.name, userId } },
      update: {},
      create: { name: data.name, color: data.color || '#6366f1', userId },
    });
  }

  async addToContact(tagId: string, contactId: string) {
    return this.prisma.contact.update({
      where: { id: contactId },
      data: { tags: { connect: { id: tagId } } },
    });
  }

  async removeFromContact(tagId: string, contactId: string) {
    return this.prisma.contact.update({
      where: { id: contactId },
      data: { tags: { disconnect: { id: tagId } } },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.tag.deleteMany({ where: { id, userId } });
  }
}
