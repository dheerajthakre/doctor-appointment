import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { DoctorAvailability } from '../doctors/doctor-availability.entity';
import { ElasticSchedulingService } from './elastic-scheduling.service';
import { ElasticSchedulingController } from './elastic-scheduling.controller';
import { Doctor } from '../doctors/doctor.entity';
import { RescheduleHistory } from 'src/appointments/reschedule-history.entity';
import { Appointment } from 'src/appointments/appointment.entity';

TypeOrmModule.forFeature([
  ElasticSlot,
  Doctor,
  RescheduleHistory,
  Appointment,
  DoctorAvailability
])

@Module({
  imports: [TypeOrmModule.forFeature([DoctorAvailability, Doctor])],
  providers: [ElasticSchedulingService],
  controllers: [ElasticSchedulingController],
})
export class ElasticSchedulingModule {}
