import * as net from 'net';
import { EventEmitter } from 'events';

export interface Player {
  id: string;
  name: string;
  socket: net.Socket;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
}

export interface GameRoom {
  id: string;
  players: Map<string, Player>;
  targetText: string;
  started: boolean;
  startTime: number;
}

export class MultiplayerServer extends EventEmitter {
  private server: net.Server;
  private rooms: Map<string, GameRoom> = new Map();
  private port: number;

  constructor(port: number = 3000) {
    super();
    this.port = port;
    this.server = net.createServer(this.handleConnection.bind(this));
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(`Multiplayer server listening on port ${this.port}`);
        resolve();
      });

      this.server.on('error', reject);
    });
  }

  stop(): void {
    this.server.close();
    this.rooms.clear();
  }

  private handleConnection(socket: net.Socket): void {
    let playerId: string | null = null;
    let roomId: string | null = null;

    socket.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join':
            ({ playerId, roomId } = this.handleJoin(socket, message));
            break;
          case 'progress':
            this.handleProgress(roomId, playerId, message);
            break;
          case 'finish':
            this.handleFinish(roomId, playerId, message);
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    socket.on('close', () => {
      if (roomId && playerId) {
        this.handleDisconnect(roomId, playerId);
      }
    });
  }

  private handleJoin(socket: net.Socket, message: any): { playerId: string; roomId: string } {
    const roomId = message.roomId || 'default';
    const playerId = message.playerId || this.generateId();
    const playerName = message.playerName || `Player ${playerId.slice(0, 4)}`;

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        players: new Map(),
        targetText: message.targetText || '',
        started: false,
        startTime: 0
      });
    }

    const room = this.rooms.get(roomId)!;
    
    room.players.set(playerId, {
      id: playerId,
      name: playerName,
      socket,
      progress: 0,
      wpm: 0,
      accuracy: 0,
      finished: false
    });

    this.broadcast(roomId, {
      type: 'playerJoined',
      playerId,
      playerName,
      playerCount: room.players.size
    });

    socket.write(JSON.stringify({
      type: 'joined',
      playerId,
      roomId,
      targetText: room.targetText
    }) + '\n');

    return { playerId, roomId };
  }

  private handleProgress(roomId: string | null, playerId: string | null, message: any): void {
    if (!roomId || !playerId) return;
    
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    player.progress = message.progress;
    player.wpm = message.wpm;
    player.accuracy = message.accuracy;

    this.broadcast(roomId, {
      type: 'progress',
      playerId,
      progress: player.progress,
      wpm: player.wpm,
      accuracy: player.accuracy
    }, playerId);
  }

  private handleFinish(roomId: string | null, playerId: string | null, message: any): void {
    if (!roomId || !playerId) return;
    
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    player.finished = true;
    player.wpm = message.wpm;
    player.accuracy = message.accuracy;

    this.broadcast(roomId, {
      type: 'playerFinished',
      playerId,
      playerName: player.name,
      wpm: player.wpm,
      accuracy: player.accuracy
    });
  }

  private handleDisconnect(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.delete(playerId);

    this.broadcast(roomId, {
      type: 'playerLeft',
      playerId,
      playerCount: room.players.size
    });

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  private broadcast(roomId: string, message: any, excludePlayerId?: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const data = JSON.stringify(message) + '\n';

    for (const [playerId, player] of room.players) {
      if (playerId !== excludePlayerId) {
        player.socket.write(data);
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
