import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class DuelGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(private prisma: PrismaService) {}

  private queues: Map<string, { userId: string; socketId: string }[]> = new Map();

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    this.queues.forEach((players, lang) => {
      this.queues.set(lang, players.filter(p => p.socketId !== client.id));
    });
  }

  @SubscribeMessage('joinQueue')
  async handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string; language: string; classroomId?: string },
  ) {
    const { userId, language, classroomId } = payload;
    const lang = language.toLowerCase();

    if (!this.queues.has(lang)) {
      this.queues.set(lang, []);
    }

    const currentQueue = this.queues.get(lang)!;
    if (currentQueue.find((p) => p.userId === userId)) return;

    currentQueue.push({ userId, socketId: client.id });

    if (currentQueue.length >= 2) {
      const p1 = currentQueue.shift();
      const p2 = currentQueue.shift();

      if (!p1 || !p2) return;

      const problemCount = await this.prisma.problem.count({
        where: { type: 'PRACTICE' } 
      });

      if (problemCount === 0) return;

      const skip = Math.floor(Math.random() * problemCount);
      const randomProblem = await this.prisma.problem.findFirst({
        where: { type: 'PRACTICE' },
        skip: skip,
      });

      if (!randomProblem) return;

      const newDuel = await this.prisma.duel.create({
        data: {
          player1Id: p1.userId,
          player2Id: p2.userId,
          problemId: randomProblem.id,
          classroomId: classroomId || null,
          status: 'ACTIVE',
          startedAt: new Date(),
        },
      });

      const roomId = `duel_${newDuel.id}`;
      this.server.in(p1.socketId).socketsJoin(roomId);
      this.server.in(p2.socketId).socketsJoin(roomId);

      this.server.to(roomId).emit('duelStarted', {
        duelId: newDuel.id,
        language: lang,
        problem: {
          id: randomProblem.id,
          title: randomProblem.title,
          description: randomProblem.description,
          difficulty: randomProblem.difficulty,
          testCases: randomProblem.testCases,
        }
      });
    }
  }

  @SubscribeMessage('join_duel_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { duelId: string }) {
    client.join(`duel_${data.duelId}`);
  }

  @SubscribeMessage('update_progress')
  handleProgress(@ConnectedSocket() client: Socket, @MessageBody() data: { duelId: string; progress: number }) {
    client.to(`duel_${data.duelId}`).emit('opponent_progress', { progress: data.progress });
  }

  @SubscribeMessage('finish_duel')
  async handleFinishDuel(
    @ConnectedSocket() client: Socket, 
    @MessageBody() data: { duelId: string; userId: string }
  ) {
    const { duelId, userId } = data;

    const duel = await this.prisma.duel.findUnique({
      where: { id: duelId },
      include: { player1: true, player2: true }
    });

    if (!duel || duel.status === 'FINISHED') return;

    const winnerName = duel.player1Id === userId ? duel.player1.name : duel.player2.name;
    const pointsToAdd = 50; 

    try {
      // 1. Incrementăm XP-ul utilizatorului
      const [updatedDuel, updatedUser] = await this.prisma.$transaction([
        this.prisma.duel.update({
          where: { id: duelId },
          data: { status: 'FINISHED', winnerId: userId, endedAt: new Date() },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: pointsToAdd } },
        }),
      ]);

      // 2. Calculăm nivelul corespunzător XP-ului total (Sincronizare Matematică)
      // La fiecare 100 XP urcăm un nivel: 0-99 (Lv 1), 100-199 (Lv 2), etc.
      const calculatedLevel = Math.floor(updatedUser.xp / 100) + 1;

      // 3. Dacă nivelul calculat este mai mare decât cel stocat, facem update
      if (calculatedLevel > updatedUser.level) {
        const finalUser = await this.prisma.user.update({
          where: { id: userId },
          data: { level: calculatedLevel },
        });

        // Trimitem evenimentul de Level Up pentru animația de confetti
        this.server.to(`duel_${duelId}`).emit('level_up', {
          newLevel: finalUser.level,
          totalXp: finalUser.xp
        });
      }

      // 4. Notificăm finalul meciului
      this.server.to(`duel_${duelId}`).emit('duel_finished', {
        winnerId: userId,
        winnerName: winnerName,
        xpGained: pointsToAdd
      });

    } catch (error) {
      client.emit('error', { message: "Eroare la procesarea rezultatelor duelului." });
    }
  }
}