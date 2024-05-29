import { Module } from '@nestjs/common';
import { FortyTwoStrategy } from './strategies/42.strategy';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseService } from 'src/database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy, RtStrategy } from './strategies';
import { CloudinaryService } from 'src/imagesProvider/cloudinary.service';

@Module({
  imports: [UsersModule, JwtModule.register({ secret: 'Secretkey' })],
  controllers: [AuthController],
  providers: [
    FortyTwoStrategy,
    UsersService,
    AuthService,
    DatabaseService,
    RtStrategy,
    AtStrategy,
    CloudinaryService,
  ],
})
export class AuthModule {}
