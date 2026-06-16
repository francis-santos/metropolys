import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from '../database/database.service';
export declare class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly db;
    server: Server;
    private connectedPlayers;
    constructor(db: DatabaseService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribeRoom(client: Socket, data: {
        roomCode: string;
        playerId: string;
    }): {
        status: string;
        roomCode: string;
        message?: undefined;
    } | {
        status: string;
        message: string;
        roomCode?: undefined;
    };
    handleUnsubscribeRoom(client: Socket, data: {
        roomCode: string;
    }): {
        status: string;
        roomCode: string;
        message?: undefined;
    } | {
        status: string;
        message: string;
        roomCode?: undefined;
    };
    broadcastRoomUpdate(roomCode: string, event: string, payload: any): void;
    broadcastTableUpdate(roomCode: string, table: string, event: 'INSERT' | 'UPDATE' | 'DELETE', record: any): void;
}
