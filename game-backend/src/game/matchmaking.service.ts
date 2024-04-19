import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@Injectable()
export class MatchmakingService {
  private logger = new Logger(MatchmakingService.name);
  private waitingPlayers: Socket[] = [];
  private currentRooms: Map<
    string,
    { players: Socket[]; gameService: GameService }
  > = new Map();
  private server: Server;

  constructor(private readonly gameService: GameService) {}

  setServer(server: Server) {
    this.server = server;
  }

  addToQueue(player: Socket) {
    this.logger.log(`Player id: ${player.id} added to Queue`);
    this.waitingPlayers.push(player);
    if (this.waitingPlayers.length >= 2) {
      const playersToMatch = this.waitingPlayers.splice(0, 2);
      this.matchPlayers(playersToMatch);
    }
    this.logger.log(
      `Status: ${this.waitingPlayers.length} player(s) in the Queue`,
    );
  }

  handlePlayerDisconnect(client: Socket) {
    this.logger.log(`Player id: ${client.id} Disconnected`);
    const roomId = this.findPlayerRoom(client);
    if (roomId) {
      const room = this.currentRooms.get(roomId);
      if (room) {
        const gameService = room.gameService;
        gameService.clearGameState();
        this.server.to(roomId).emit('playerLeft', {
          winner: null,
          reason: 'Opponent disconnected',
        });
        this.currentRooms.delete(roomId);
      }
    }
    const remainingPlayers = this.waitingPlayers.filter(
      (p) => p.id !== client.id,
    );
    this.waitingPlayers = remainingPlayers;
  }

  private matchPlayers(players: Socket[]) {
    const roomId = Date.now().toString();
    const gameService = new GameService(800, 500);
    gameService.setServer(this.server, roomId);
    this.currentRooms.set(roomId, { players, gameService }); // Assign GameService instance to the room
    players.forEach((player, index) => {
      player.join(roomId);
      player.emit('matchFound', { roomId, playerNumber: index + 1 });
    });
    this.manageRunningRoom(roomId);
  }

  private manageRunningRoom(roomId: string) {
    const room = this.currentRooms.get(roomId);
    if (room) {
      const gameService = room.gameService;
      const gameState = gameService.getGameState();
      this.server.to(roomId).emit('startingGame', gameState);
      setTimeout(() => {
        gameService.startGame();
      }, 5000);
    } else {
      this.server
        .to(roomId)
        .emit('matchCancelled', { reason: 'Not enough players' });
      this.currentRooms.delete(roomId);
    }
  }

  movePlayer(roomId: string, player: number, direction: 'up' | 'down') {
    const room = this.currentRooms.get(roomId);
    if (room) {
      const gameService = room.gameService;
      gameService.handlePlayerMovement(player, direction);
    }
  }

  private findPlayerRoom(player: Socket): string | undefined {
    for (const [roomId, room] of this.currentRooms.entries()) {
      if (room.players.includes(player)) {
        return roomId;
      }
    }
    return undefined;
  }
}
