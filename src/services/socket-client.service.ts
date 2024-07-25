import { Injectable, OnModuleInit } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';

@Injectable()
export class SocketClientService implements OnModuleInit {
  private socket: Socket;

  onModuleInit() {
    this.socket = io('http://localhost:8000');
    // this.socket = io('https://cgp-rider-api.onrender.com');
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });
    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });
  }

  emitOrderStatusUpdate(orderId: number) {
    this.socket.emit('updateOrderStatus', { orderId });
  }
}
