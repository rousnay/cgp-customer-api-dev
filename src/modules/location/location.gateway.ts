import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LocationService } from './location.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: true,
})
export class LocationGateway {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('LocationGateway');

  constructor(private readonly locationService: LocationService) {}

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('getLocation')
  async handleGetLocation(client: Socket, riderId: number) {
    this.logger.log(`Handling getLocation for riderId: ${riderId}`);
    const location = await this.locationService.getLocation(riderId);
    client.emit('locationData', location);
  }

  @SubscribeMessage('getNearbyRiders')
  async handleGetNearbyRiders(
    client: Socket,
    payload: { latitude: number; longitude: number; radius: number },
  ) {
    this.logger.log(
      `Handling getNearbyRiders with payload: ${JSON.stringify(payload)}`,
    );
    const { latitude, longitude, radius } = payload;
    try {
      const riders = await this.locationService.getNearbyRiders(
        latitude,
        longitude,
        radius,
      );
      this.logger.log(`Found ${riders.length} riders`);
      client.emit('nearbyRidersData', riders);
    } catch (error) {
      this.logger.error('Error fetching nearby riders', error);
      client.emit('error', { message: 'Error fetching nearby riders' });
    }
  }
}
