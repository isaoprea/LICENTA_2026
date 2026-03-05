import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('channels')
  getChannels() {
    return this.chatService.getChannels();
  }

  @Get('messages/:channelId')
  getMessages(@Param('channelId') channelId: string) {
    return this.chatService.getMessagesByChannel(channelId);
  }
}