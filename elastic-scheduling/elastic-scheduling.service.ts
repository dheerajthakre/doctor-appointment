import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';

import { DoctorAvailability } from '../doctors/doctor-availability.entity';
import { Doctor } from '../doctors/doctor.entity';
import { ExpandSessionDto } from './dto/expand-session.dto';

@Injectable()
export class ElasticSchedulingService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private slotRepo: Repository<DoctorAvailability>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async expandSession(userId: string, dto: ExpandSessionDto) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
    });

    const existingSlots = await this.slotRepo.find({
      where: { doctor: { id: doctor.id }, date: dto.date },
      order: { startTime: 'ASC' },
    });

    if (!existingSlots.length) {
      throw new BadRequestException('No base session found');
    }

    const firstSlot = existingSlots[0];
    const lastSlot = existingSlots[existingSlots.length - 1];

    // EXPAND START
    if (dto.newStartTime && dto.newStartTime < firstSlot.startTime) {
      const newSlots = this.generateWaveSlots(
        dto.date,
        dto.newStartTime,
        firstSlot.startTime,
        dto.consultationDuration,
        dto.waveCapacity,
        doctor,
      );

      await this.slotRepo.save(newSlots);
    }

    // EXPAND END
    if (dto.newEndTime && dto.newEndTime > lastSlot.endTime) {
      const newSlots = this.generateWaveSlots(
        dto.date,
        lastSlot.endTime,
        dto.newEndTime,
        dto.consultationDuration,
        dto.waveCapacity,
        doctor,
      );

      await this.slotRepo.save(newSlots);
    }

    return { message: 'Session expanded with wave scheduling' };
  }

  // WAVE SLOT GENERATOR
  generateWaveSlots(
    date: string,
    start: string,
    end: string,
    duration: number,
    waveCapacity: number,
    doctor: Doctor,
  ) {
    const result = [];

    let current = dayjs(`2024-01-01T${start}`);
    const endTime = dayjs(`2024-01-01T${end}`);

    let capacity = waveCapacity;

    while (
      current.add(duration, 'minute').isBefore(endTime) ||
      current.add(duration, 'minute').isSame(endTime)
    ) {
      result.push(
        this.slotRepo.create({
          doctor,
          date,
          startTime: current.format('HH:mm'),
          endTime: current.add(duration, 'minute').format('HH:mm'),
          maxPatients: capacity,
          bookedCount: 0,
        }),
      );

      current = current.add(duration, 'minute');

      if (capacity > 1) capacity--; // wave effect
    }

    return result;
  }
}
