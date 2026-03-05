import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getChannels() {
    return this.prisma.channel.findMany({ orderBy: { name: 'asc' } });
  }

  async getMessagesByChannel(channelId: string) {
    return this.prisma.message.findMany({
      where: { channelId },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async saveMessage(userId: string, content: string, channelId: string) {
    return this.prisma.message.create({
      data: { content, userId, channelId },
      include: { user: { select: { name: true, role: true } } }
    });
  }
}