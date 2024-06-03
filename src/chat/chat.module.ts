import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: 'Location', schema: LocationSchema }]),
  ],
  providers: [ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
