import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { DoctorAvailability, WeekDay } from './doctor-availability.entity';
import { Doctor } from './doctor.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class DoctorAvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private availabilityRepo: Repository<DoctorAvailability>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async create(doctorUserId: string, dto: CreateAvailabilityDto) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: doctorUserId } },
    });

    if (!doctor) {
      throw new BadRequestException('Doctor profile not found');
    }

    const { date, startTime, endTime, isRecurring, dayOfWeek, maxPatients } = dto;

    if (startTime >= endTime) {
      throw new BadRequestException(
        'End time must be greater than start time',
      );
    }

    const weekDayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    // RECURRING LOGIC
    if (isRecurring) {
      if (!dayOfWeek) {
        throw new BadRequestException(
          'dayOfWeek is required for recurring availability',
        );
      }

      const targetDayNumber = weekDayMap[dayOfWeek];
      const weeksToGenerate = 4; // Generate for next 4 weeks
      const createdSlots = [];
      const today = new Date();

      for (let i = 0; i < weeksToGenerate * 7; i++) {
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + i);

        if (futureDate.getDay() === targetDayNumber) {
          const formattedDate = futureDate
            .toISOString()
            .split('T')[0];

          const conflict = await this.availabilityRepo.findOne({
            where: {
              doctor: { id: doctor.id },
              date: formattedDate,
              startTime: LessThan(endTime),
              endTime: MoreThan(startTime),
            },
          });

          if (!conflict) {
            const slot = this.availabilityRepo.create({
              doctor,
              date: formattedDate,
              startTime,
              endTime,
              isRecurring: true,
              dayOfWeek,
              maxPatients: maxPatients || 1,
            });

            createdSlots.push(
              await this.availabilityRepo.save(slot),
            );
          }
        }
      }

      return {
        message: 'Recurring availability created',
        slotsCreated: createdSlots.length,
      };
    }

    // ONE-TIME SLOT
    if (!date) {
      throw new BadRequestException('Date is required');
    }

    const conflict = await this.availabilityRepo.findOne({
      where: {
        doctor: { id: doctor.id },
        date,
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });

    if (conflict) {
      throw new BadRequestException(
        'Availability slot overlaps with existing slot',
      );
    }

    const availability = this.availabilityRepo.create({
      doctor,
      date,
      startTime,
      endTime,
      isRecurring: false,
      maxPatients: maxPatients || 1,
    });

    return this.availabilityRepo.save(availability);
  }
}
