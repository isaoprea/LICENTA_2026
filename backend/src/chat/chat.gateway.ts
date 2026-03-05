import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer() server: Server;
  constructor(private chatService: ChatService) {}

  @SubscribeMessage('joinChannel')
  handleJoinChannel(@ConnectedSocket() client: Socket, @MessageBody() channelId: string) {
    client.join(channelId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { userId: string, content: string, channelId: string }) {
    const newMessage = await this.chatService.saveMessage(data.userId, data.content, data.channelId);
    this.server.to(data.channelId).emit('receiveMessage', newMessage);
  }
}