import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { Profile } from './profile.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
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
}
