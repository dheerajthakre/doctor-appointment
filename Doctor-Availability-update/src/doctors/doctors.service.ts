import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { Profile } from './profile.entity';
import { VerificationToken } from './verification-token.entity';
import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Specialization } from './specialization.entity';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { CreateSpecializationDto } from './dto/create-specialization.dto';


@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    @InjectRepository(VerificationToken)
    private verificationRepo: Repository<VerificationToken>,

    @InjectRepository(Specialization)
    private specializationRepo: Repository<Specialization>,


  ) {}

  async updateProfile(userId: string, body: any) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['profile'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // If profile does not exist → create new
    if (!doctor.profile) {
      const profile = this.profileRepo.create({
        ...body,
        doctor,
      });

      return await this.profileRepo.save(profile);
    }

    // If profile exists → update
    Object.assign(doctor.profile, body);

    return await this.profileRepo.save(doctor.profile);
  }

  async sendVerification(userId: string, dto: CreateVerificationDto) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!doctor) throw new NotFoundException('Doctor not found');

  doctor.licenseNumber = dto.licenseNumber;
  await this.doctorRepo.save(doctor);

  const token = randomBytes(32).toString('hex');

  const verification = this.verificationRepo.create({
    doctor,
    token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
  });

  await this.verificationRepo.save(verification);

  return {
    message: 'Verification token generated',
    token, // in real app send via email
  };
}

async confirmVerification(userId: string, token: string) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!doctor) throw new NotFoundException('Doctor not found');

  const record = await this.verificationRepo.findOne({
    where: { token },
    relations: ['doctor'],
  });

  if (!record || record.expiresAt < new Date()) {
    throw new BadRequestException('Invalid or expired token');
  }

  doctor.isApproved = true;
  await this.doctorRepo.save(doctor);

  await this.verificationRepo.delete(record.id);

  return { message: 'Doctor verified successfully' };
}

async addSpecialization(userId: string, dto: CreateSpecializationDto) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!doctor) throw new NotFoundException('Doctor not found');

  const spec = this.specializationRepo.create({
    name: dto.name,
    doctor,
  });

  return this.specializationRepo.save(spec);
}

async getMySpecializations(userId: string) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
    relations: ['specializations'],
  });

  if (!doctor) throw new NotFoundException('Doctor not found');

  return doctor.specializations;
}

}
