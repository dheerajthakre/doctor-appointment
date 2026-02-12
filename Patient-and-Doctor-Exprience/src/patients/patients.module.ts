import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { PatientProfile } from './patient-profile.entity';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, PatientProfile]),
  ],
  providers: [PatientsService],
  controllers: [PatientsController],
})
export class PatientsModule {}
