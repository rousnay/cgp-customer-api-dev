import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LocationService } from './location.service';

@WebSocketGateway({
  cors: true,
})
export class LocationGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly locationService: LocationService) {}

  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(
    client: Socket,
    payload: { riderId: number; latitude: number; longitude: number },
  ) {
    const location = await this.locationService.updateLocation(
      payload.riderId,
      payload.latitude,
      payload.longitude,
    );
    this.server.emit('locationUpdated', location);
  }

  @SubscribeMessage('getLocation')
  async handleGetLocation(client: Socket, riderId: number) {
    const location = await this.locationService.getLocation(riderId);
    client.emit('locationData', location);
  }
}
