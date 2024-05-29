import { User } from '@prisma/client';

export class profile {
  constructor(friend: Partial<User>) {
    this.firstName = friend?.firstName;
    this.lastName = friend?.lastName;
    this.avatar = friend?.avatar;
  }
  uername: string;
  firstName: string;
  lastName: string;
  avatar: string;
}
