import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private onlineUsers = new Map<string, any>();

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('identify')
  handleIdentify(@ConnectedSocket() client: Socket, @MessageBody() user: any) {
    if (!user) return;
    this.onlineUsers.set(client.id, user);
    
    this.server.emit('updateUserList', Array.from(this.onlineUsers.values()));
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket, 
    @MessageBody() data: { channelId: string; isTyping: boolean }
  ) {
    const user = this.onlineUsers.get(client.id);
    if (!user) return;

   
    client.to(data.channelId).emit('userTyping', {
      userId: user.id,
      name: user.name,
      isTyping: data.isTyping
    });
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(@ConnectedSocket() client: Socket, @MessageBody() channelId: string) {
    client.join(channelId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { userId: string, content: string, channelId: string }) {
    const newMessage = await this.chatService.saveMessage(data.userId, data.content, data.channelId);
    this.server.to(data.channelId).emit('receiveMessage', newMessage);
  }

  @SubscribeMessage('toggleReaction')
  async handleToggleReaction(@MessageBody() data: { messageId: string; userId: string; emoji: string }) {
    const updated = await this.chatService.toggleReaction(data.messageId, data.userId, data.emoji);
    if (updated) {
      this.server.to(updated.channelId).emit('reactionUpdated', updated);
    }
  }

  handleDisconnect(client: Socket) {
    this.onlineUsers.delete(client.id);
    this.server.emit('updateUserList', Array.from(this.onlineUsers.values()));
  }
}