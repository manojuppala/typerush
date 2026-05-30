import * as net from 'net';
import { EventEmitter } from 'events';

export interface MultiplayerPlayer {
  id: string;
  name: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
}

export class MultiplayerClient extends EventEmitter {
  private socket: net.Socket | null = null;
  private connected: boolean = false;
  private playerId: string | null = null;
  private roomId: string | null = null;
  public players: Map<string, MultiplayerPlayer> = new Map();

  async connect(host: string = 'localhost', port: number = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection({ host, port }, () => {
        this.connected = true;
        this.setupListeners();
        resolve();
      });

      this.socket.on('error', (error) => {
        this.connected = false;
        reject(error);
      });
    });
  }

  private setupListeners(): void {
    if (!this.socket) return;

    let buffer = '';

    this.socket.on('data', (data) => {
      buffer += data.toString();
      const messages = buffer.split('\n');
      buffer = messages.pop() || '';

      for (const msg of messages) {
        if (msg.trim()) {
          try {
            const message = JSON.parse(msg);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        }
      }
    });

    this.socket.on('close', () => {
      this.connected = false;
      this.emit('disconnected');
    });
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'joined':
        this.playerId = message.playerId;
        this.roomId = message.roomId;
        this.emit('joined', {
          playerId: message.playerId,
          roomId: message.roomId,
          targetText: message.targetText
        });
        break;

      case 'playerJoined':
        this.players.set(message.playerId, {
          id: message.playerId,
          name: message.playerName,
          progress: 0,
          wpm: 0,
          accuracy: 0,
          finished: false
        });
        this.emit('playerJoined', message);
        break;

      case 'playerLeft':
        this.players.delete(message.playerId);
        this.emit('playerLeft', message);
        break;

      case 'progress':
        const player = this.players.get(message.playerId);
        if (player) {
          player.progress = message.progress;
          player.wpm = message.wpm;
          player.accuracy = message.accuracy;
          this.emit('progress', message);
        }
        break;

      case 'playerFinished':
        const finishedPlayer = this.players.get(message.playerId);
        if (finishedPlayer) {
          finishedPlayer.finished = true;
          finishedPlayer.wpm = message.wpm;
          finishedPlayer.accuracy = message.accuracy;
          this.emit('playerFinished', message);
        }
        break;
    }
  }

  joinRoom(roomId: string, playerName: string, targetText: string): void {
    if (!this.socket || !this.connected) return;

    this.send({
      type: 'join',
      roomId,
      playerName,
      targetText
    });
  }

  sendProgress(progress: number, wpm: number, accuracy: number): void {
    if (!this.socket || !this.connected) return;

    this.send({
      type: 'progress',
      progress,
      wpm,
      accuracy
    });
  }

  sendFinish(wpm: number, accuracy: number): void {
    if (!this.socket || !this.connected) return;

    this.send({
      type: 'finish',
      wpm,
      accuracy
    });
  }

  private send(message: any): void {
    if (!this.socket) return;
    this.socket.write(JSON.stringify(message) + '\n');
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getPlayerId(): string | null {
    return this.playerId;
  }
}
