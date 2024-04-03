import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@Injectable()
export class MatchmakingService {
  private logger = new Logger(MatchmakingService.name);
  private waitingPlayers: Socket[] = [];
  private currentRooms: Map<string, Socket[]> = new Map();
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

  handlePlayerDisconnect(player: Socket) {
    this.logger.log(`Player id: ${player.id} Disconnected`);
    this.removePlayerFromRoom(player);

    // Check if there's only one player left in the room
    this.currentRooms.forEach((players, roomId) => {
      if (players.length === 1) {
        const remainingPlayer = players[0];
        remainingPlayer.leave(roomId);
        this.currentRooms.delete(roomId);
        this.gameService.clearGameState();
        this.server
          .to(roomId)
          .emit('gameEnded', { winner: null, reason: 'Opponent disconnected' });
      }
    });

    // Remove the disconnected player from the waiting queue
    const remainingPlayers = this.waitingPlayers.filter(
      (p) => p.id !== player.id,
    );
    this.waitingPlayers = remainingPlayers;
  }
  private matchPlayers(players: Socket[]) {
    const roomId = Date.now().toString();
    this.currentRooms.set(roomId, players); // Assign players to the room
    players.forEach((player, index) => {
      player.join(roomId);
      player.emit('matchFound', { roomId, playerNumber: index + 1 });
    });
    this.manageRunningRoom(roomId);
  }

  private manageRunningRoom(roomId: string) {
    const gameState = this.gameService.getGameState();
    this.gameService.setServer(this.server, roomId);

    const roomPlayers = this.currentRooms.get(roomId);
    if (roomPlayers && roomPlayers.length === 2) {
      this.server.to(roomId).emit('startingGame', gameState);
      setTimeout(() => {
        this.gameService.startGame();
      }, 5000);
    } else {
      this.server
        .to(roomId)
        .emit('matchCancelled', { reason: 'Not enough players' });
      this.currentRooms.delete(roomId);
      this.gameService.clearGameState();
    }
  }

  movePlayer(roomId: string, player: number, direction: 'up' | 'down') {
    this.logger.log(`Player ${player} moved ${direction}`);
    const playersInRoom = this.currentRooms.get(roomId);
    if (playersInRoom) {
      this.gameService.handlePlayerMovement(player, direction);
    }
  }

  private removePlayerFromRoom(player: Socket) {
    this.currentRooms.forEach((players, roomId) => {
      const index = players.indexOf(player);
      if (index !== -1) {
        players.splice(index, 1);
        if (players.length === 0) {
          this.currentRooms.delete(roomId);
        }
      }
    });
  }

  pauseGame(client: Socket, roomId: string) {
    this.logger.log(`Game paused in room ${roomId}`);
    const roomPlayers = this.currentRooms.get(roomId);
    if (roomPlayers) {
      this.server.to(roomId).emit('gamePaused');
      this.gameService.pauseGame();
    }
  }

  resumeGame(client: Socket, roomId: string) {
    this.logger.log(`Game resumed in room ${roomId}`);
    const roomPlayers = this.currentRooms.get(roomId);
    if (roomPlayers) {
      this.server.to(roomId).emit('gameResumed');
      this.gameService.resumeGame();
    }
  }
}
