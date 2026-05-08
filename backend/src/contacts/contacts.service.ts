import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Readable } from 'stream';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const csvParser = require('csv-parser');

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.contact.findMany({
      where: { userId },
      include: { tags: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { phone: string; name?: string; email?: string }, userId: string) {
    const normalizedPhone = this.normalizePhone(data.phone);
    return this.prisma.contact.upsert({
      where: { phone_userId: { phone: normalizedPhone, userId } },
      update: { name: data.name, email: data.email },
      create: { phone: normalizedPhone, name: data.name, email: data.email, userId },
    });
  }

  async importFromCsv(fileBuffer: Buffer, userId: string): Promise<{ created: number; skipped: number }> {
    const results: { phone: string; name?: string; email?: string }[] = [];

    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(fileBuffer);
      stream
        .pipe(csvParser())
        .on('data', (row: any) => {
          // Suporta colunas: phone/telefone/numero, name/nome, email
          const phone = row.phone || row.telefone || row.numero || row.whatsapp;
          const name = row.name || row.nome;
          const email = row.email;
          if (phone) {
            results.push({ phone: this.normalizePhone(String(phone)), name, email });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    let created = 0;
    let skipped = 0;

    // Inserção em lote usando upsert para evitar duplicatas
    for (const contact of results) {
      try {
        const existing = await this.prisma.contact.findUnique({
          where: { phone_userId: { phone: contact.phone, userId } },
        });
        if (existing) {
          skipped++;
        } else {
          await this.prisma.contact.create({
            data: { ...contact, userId },
          });
          created++;
        }
      } catch {
        skipped++;
      }
    }

    return { created, skipped };
  }

  async delete(id: string, userId: string) {
    return this.prisma.contact.deleteMany({ where: { id, userId } });
  }

  private normalizePhone(phone: string): string {
    // Remove tudo que não é dígito
    const digits = phone.replace(/\D/g, '');
    // Garante DDI 55 (Brasil)
    if (digits.startsWith('55') && digits.length >= 12) return digits;
    if (digits.length === 11 || digits.length === 10) return `55${digits}`;
    return digits;
  }
}
