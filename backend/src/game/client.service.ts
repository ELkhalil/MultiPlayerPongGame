import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DatabaseService } from '../database/database.service';
import { SOCKET_ERROR, SOCKET_EVENT } from './constants/socket.constants';
import { ERROR } from './constants/errors.messages';

interface User {
  userId: string;
}

@Injectable()
export class ClientService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly database: DatabaseService,
  ) {}

  async checkClientAccess(client: Socket): Promise<User> {
    const accessToken = client.handshake.auth.token as string;
    if (!accessToken) {
      client.emit(SOCKET_EVENT.NO_ACCESS, {
        message: SOCKET_ERROR.NO_ACCESS_ERR,
      });
      client.disconnect();
      throw new WsException(ERROR.NO_ACCESS_TOKEN);
    }
    return await this.verifyClient(client, accessToken);
  }

  private async verifyClient(client: Socket, token: string): Promise<User> {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded) {
        const user = await this.findUser(client, decoded.sub);
        return user;
      }
    } catch (error) {
      client.emit(SOCKET_EVENT.INVALID_TOKEN, {
        message: SOCKET_ERROR.INVALID_TOKEN_ERR,
      });
      client.disconnect();
      throw new WsException(ERROR.INVALID_ACCESS_TOKEN);
    }
  }

  private async findUser(client: Socket, userId: string): Promise<User> {
    if (!userId) {
      client.emit(SOCKET_EVENT.RECOGNITION, {
        message: SOCKET_ERROR.RECOGNITION_ERROR,
      });
      client.disconnect();
      throw new WsException(ERROR.FAIL_DECODE_TOKEN);
    }
    const user = await this.database.user.findUnique({
      where: { userId: userId },
      select: {
        userId: true,
      },
    });
    if (!user || !user.userId || user.userId === '') {
      client.emit(SOCKET_EVENT.USER_NOT_FOUND, {
        message: SOCKET_ERROR.NOT_FOUND_ERR,
      });
      client.disconnect();
      throw new WsException(ERROR.NOT_FOUND);
    }
    return user;
  }
}
