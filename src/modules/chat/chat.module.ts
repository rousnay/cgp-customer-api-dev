import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { LocationSchema } from '@modules/location/schemas/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Location', schema: LocationSchema }]),
  ],
  providers: [ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
