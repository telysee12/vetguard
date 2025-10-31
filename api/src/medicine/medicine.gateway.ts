import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/medicines' })
export class MedicineGateway {
  @WebSocketServer()
  server: Server;

  broadcastMedicineUpdate(medicine) {
    this.server.emit('medicineUpdate', medicine);
  }
  
  broadcastAllMedicinesUpdate(medicines) {
    this.server.emit('medicinesUpdate', medicines);
  }
}
