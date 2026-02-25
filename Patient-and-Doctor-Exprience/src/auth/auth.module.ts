import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';


@Module({
  imports: [
    ConfigModule, 

    //TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([User, Doctor, Patient]),


    PassportModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'access-secret',
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

