import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { User, UserRole } from '../users/user.entity';
import * as bcrypt from 'bcrypt'; // add new
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';


@Injectable()
export class AuthService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
     @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,

    private jwtService: JwtService,
  ) {}


  async googleLogin(idToken: string, role: UserRole) {
    if (!idToken) throw new UnauthorizedException('ID Token required');
    if (!role || !Object.values(UserRole).includes(role))
      throw new UnauthorizedException('Invalid role');

    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new UnauthorizedException('Invalid Google token');

    const { email, name, picture } = payload;

    let user = await this.userRepo.findOne({ where: { email } });

    //If new user → create user + role record
    if (!user) {
      user = this.userRepo.create({
        email,
        name,
        picture,
        role,
      });
      await this.userRepo.save(user);

      // Auto create Doctor

      if(role === UserRole.DOCTOR){
        const existingDoctor = await this.doctorRepo.findOne({
          where: { user: { id: user.id } },
        });

        if (!existingDoctor) {
          await this.doctorRepo.save({ user });
        }
      }

      // Auto create Patient
      if (role === UserRole.PATIENT) {
        const existingPatient = await this.patientRepo.findOne({
          where: { user: { id: user.id } },
        });

      if (!existingPatient) {
        await this.patientRepo.save({ user });
      }
    }

    }

    return this.generateTokens(user);
  }

  // Generate Access + Refresh Token
  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: '7d',
    });

    // hash refresh token before saving
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    await this.userRepo.update(user.id, {
      refreshToken: hashedRefresh,
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  // Refresh Token
  async refreshTokens(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const user = await this.userRepo.findOne({
        where: { id: decoded.sub },
      });

      if (!user || !user.refreshToken)
        throw new UnauthorizedException();

      const isMatch = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isMatch) throw new UnauthorizedException();

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Logout
  async logout(userId: string) {
    await this.userRepo.update(userId, {
      refreshToken: null,
    });
    return { message: 'Logged out successfully' };
  }

  /*async googleLogin(idToken: string, role: UserRole) {
  if (!idToken) {
    throw new UnauthorizedException('ID Token is required');
  }

  if (!role) {
    throw new UnauthorizedException('Role is required');
  }

  if (!Object.values(UserRole).includes(role)) {
    throw new UnauthorizedException('Invalid role');
  }

  const ticket = await this.client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new UnauthorizedException('Invalid Google token');

  const { email, name, picture } = payload;

  let user = await this.userRepo.findOne({ where: { email } });

  if (!user) {
    user = this.userRepo.create({
      email,
      name,
      picture,
      role, //  now valid
    });

    await this.userRepo.save(user);
  }

  const token = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken: token,
    user,
  };
}
*/
  /*async googleLogin(idToken: string, role: UserRole) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new UnauthorizedException('Invalid Google token');

    const { email, name, picture } = payload;

    let user = await this.userRepo.findOne({ where: { email: payload.email } });

    if (!user) {
      user = this.userRepo.create({
        email: payload.email,
        name: payload.name,
        //picture,
        role: role as UserRole,
      });
      await this.userRepo.save(user);
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
      user,
    };
  }*/
}
