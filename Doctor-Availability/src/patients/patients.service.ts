import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { PatientProfile } from './patient-profile.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,

    @InjectRepository(PatientProfile)
    private profileRepo: Repository<PatientProfile>,
  ) {}


  async completeOnboarding(userId: string, body: any) {
  let patient = await this.patientRepo.findOne({
    where: { user: { id: userId } },
    relations: ['profile', 'user'],
  });

  //  If patient not found → create it
  if (!patient) {
    patient = this.patientRepo.create({
      user: { id: userId },
      isOnboarded: false,
    });

    patient = await this.patientRepo.save(patient);
  }

  let profile = await this.profileRepo.findOne({
    where: { patient: { id: patient.id } },
  });

  if (!profile) {
    profile = this.profileRepo.create({
      age: body.age,
      gender: body.gender,
      phone: body.phone,
      address: body.address,
      patient: patient,
    });
  } else {
    Object.assign(profile, body);
  }

  await this.profileRepo.save(profile);

  patient.isOnboarded = true;
  await this.patientRepo.save(patient);

  return {
    message: 'Onboarding completed',
    profile,
  };
}

  /*async completeOnboarding(userId: string, body: any) {
    const patient = await this.patientRepo.findOne({
      where: { user: { id: userId } },
      relations: ['profile', 'user'],
    });

    if (!patient) throw new NotFoundException('Patient not found');

    let profile: PatientProfile = patient.profile;

    profile = this.profileRepo.create({
      age: body.age,
      gender: body.gender,
      phone: body.phone,
      address: body.address,
      patient: patient,
    });


    *if (!profile) {
      profile = this.profileRepo.create({
        ...body,
        patient,
      });
    } else {
      Object.assign(profile, body);
    }*

    await this.profileRepo.save(profile);

    patient.isOnboarded = true;
    await this.patientRepo.save(patient);

    return {
      message: 'Onboarding completed',
      profile,
    };
  }*/
}
