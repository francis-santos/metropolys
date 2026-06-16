import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { DatabaseService } from '../database/database.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected players mapping: socketId -> { roomId, playerId }
  private connectedPlayers = new Map<string, { roomId: string; playerId: string }>();

  constructor(private readonly db: DatabaseService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const playerMapping = this.connectedPlayers.get(client.id);
    if (playerMapping) {
      this.db.load();
      const player = this.db.players.find(p => p.id === playerMapping.playerId);
      if (player) {
        player.isOnline = false;
        this.db.save();
        console.log(`Presence: Player ${player.name} is now OFFLINE`);
        this.broadcastTableUpdate(playerMapping.roomId, 'players', 'UPDATE', player);
      }
      this.connectedPlayers.delete(client.id);
    }
  }

  @SubscribeMessage('subscribe_room')
  handleSubscribeRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; playerId: string },
  ) {
    const { roomCode, playerId } = data;
    if (roomCode) {
      client.join(roomCode);
      console.log(`Client ${client.id} (Player: ${playerId}) joined room code: ${roomCode}`);
      
      if (playerId && playerId !== 'client-guest') {
        this.db.load();
        const player = this.db.players.find(p => p.id === playerId);
        if (player) {
          player.isOnline = true;
          this.db.save();
          console.log(`Presence: Player ${player.name} is now ONLINE`);
          this.connectedPlayers.set(client.id, { roomId: roomCode, playerId });
          this.broadcastTableUpdate(roomCode, 'players', 'UPDATE', player);
        }
      }
      
      return { status: 'subscribed', roomCode };
    }
    return { status: 'error', message: 'No roomCode provided' };
  }

  @SubscribeMessage('unsubscribe_room')
  handleUnsubscribeRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ) {
    const { roomCode } = data;
    if (roomCode) {
      client.leave(roomCode);
      console.log(`Client ${client.id} left room code: ${roomCode}`);
      return { status: 'unsubscribed', roomCode };
    }
    return { status: 'error', message: 'No roomCode provided' };
  }

  broadcastRoomUpdate(roomCode: string, event: string, payload: any) {
    if (this.server) {
      this.server.to(roomCode).emit(event, payload);
    }
  }

  // Broadcaster utility method called from services when database records change
  broadcastTableUpdate(roomCode: string, table: string, event: 'INSERT' | 'UPDATE' | 'DELETE', record: any) {
    if (this.server) {
      this.server.to(roomCode).emit('postgres_changes', {
        table,
        event,
        record,
      });
    }
  }
}
