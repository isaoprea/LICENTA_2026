import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private buildReactionSummary(reactions: Array<{ emoji: string; userId: string }>) {
    const grouped = reactions.reduce<Record<string, Set<string>>>((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = new Set<string>();
      }
      acc[reaction.emoji].add(reaction.userId);
      return acc;
    }, {});

    return Object.entries(grouped).map(([emoji, usersSet]) => {
      const userIds = Array.from(usersSet);
      return {
        emoji,
        count: userIds.length,
        userIds,
      };
    });
  }

  private mapMessageWithReactions(message: {
    id: string;
    content: string;
    createdAt: Date;
    userId: string;
    channelId: string;
    user: { name: string | null; role: string };
    reactions: Array<{ emoji: string; userId: string }>;
  }) {
    return {
      ...message,
      reactionSummary: this.buildReactionSummary(message.reactions),
    };
  }

  async getChannels() {
    return this.prisma.channel.findMany({ orderBy: { name: 'asc' } });
  }

  async getMessagesByChannel(channelId: string) {
    const messages = await this.prisma.message.findMany({
      where: { channelId },
      include: {
        user: { select: { name: true, role: true } },
        reactions: { select: { emoji: true, userId: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((message) => this.mapMessageWithReactions(message));
  }

  async saveMessage(userId: string, content: string, channelId: string) {
    const newMessage = await this.prisma.message.create({
      data: { content, userId, channelId },
      include: {
        user: { select: { name: true, role: true } },
        reactions: { select: { emoji: true, userId: true } },
      },
    });

    return this.mapMessageWithReactions(newMessage);
  }

  async toggleReaction(messageId: string, userId: string, emoji: string) {
    const existingReaction = await this.prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      await this.prisma.messageReaction.delete({ where: { id: existingReaction.id } });
    } else {
      await this.prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          emoji,
        },
      });
    }

    const messageWithReactions = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: { select: { name: true, role: true } },
        reactions: { select: { emoji: true, userId: true } },
      },
    });

    if (!messageWithReactions) {
      return null;
    }

    return this.mapMessageWithReactions(messageWithReactions);
  }
}