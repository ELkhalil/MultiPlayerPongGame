import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private DatabaseService: DatabaseService) {}
  async createUser(createUserDto: CreateUserDto) {
    return this.DatabaseService.user.create({
      data: {
        ...createUserDto,
        userLevel: 4,
      },
    });
  }
  async update(userId: string, udateuserDto: UpdateUserDto) {
    return this.DatabaseService.user.update({
      where: {
        userId: userId,
      },
      data: udateuserDto,
    });
  }
  async getAllUsers() {
    return this.DatabaseService.user.findMany();
  }

  // TODO: Implement this method and add frindshipId to the user
  async getUserById(id: string) {
    return this.DatabaseService.user.findUnique({
      where: {
        userId: id,
      },
    });
  }

  async getUserByUsername(username: string) {
    return this.DatabaseService.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  async getUserByEmail(email: string) {
    return this.DatabaseService.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const hashPassword = await bcrypt.hash(updateUserDto.password, 10);
    return this.DatabaseService.user.update({
      where: {
        userId: id,
      },
      data: {
        username: updateUserDto.username,
        email: updateUserDto.email,
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        avatar: updateUserDto.avatar,
        password: hashPassword,
      },
    });
  }

  async updateAvatar(id: string, avatar: string) {
    return this.DatabaseService.user.update({
      where: {
        userId: id,
      },
      data: {
        avatar: avatar,
      },
    });
  }

  async updatePassword(id: string, password: string) {
    const hashPassword = await bcrypt.hash(password, 10);

    return this.DatabaseService.user.update({
      where: {
        userId: id,
      },
      data: {
        password: hashPassword,
      },
    });
  }

  async updateUsername(id: string, updateUserDto: UpdateUserDto) {
    return this.DatabaseService.user.update({
      where: {
        userId: id,
      },
      data: {
        username: updateUserDto.username,
      },
    });
  }

  async updateEmail(id: string, updateUserDto: UpdateUserDto) {
    return this.DatabaseService.user.update({
      where: {
        userId: id,
      },
      data: {
        email: updateUserDto.email,
      },
    });
  }

  async updateFirstName(id: string, updateUserDto: UpdateUserDto) {
    return this.DatabaseService.user.update({
      where: {
        userId: id,
      },
      data: {
        firstName: updateUserDto.firstName,
      },
    });
  }

  async updateLastName(id: string, updateUserDto: UpdateUserDto) {
    return this.DatabaseService.user.update({
      where: {
        userId: id,
      },
      data: {
        lastName: updateUserDto.lastName,
      },
    });
  }

  async deleteUser(id: string) {
    return this.DatabaseService.user.delete({
      where: {
        userId: id,
      },
    });
  }

  async getUserByIntraId(intraId: string) {
    return this.DatabaseService.user.findUnique({
      where: {
        intraId: intraId,
      },
    });
  }

  async GetSearchedUsers(name: string, currentUserID: string) {
    const users = await this.DatabaseService.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: name,
              mode: 'insensitive',
            },
          },
          {
            firstName: {
              contains: name,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: name,
              mode: 'insensitive',
            },
          },
        ],
        NOT: {
          OR: [
            {
              blockedUser: {
                some: {
                  blocked: currentUserID,
                },
              },
              blockedByUser: {
                some: {
                  blockedBy: currentUserID,
                },
              },
            },
          ],
        },
      },
    });
    console.log(users);
    return users.map((user) => {
      return {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      };
    });
  }
}
