import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { DoctorAvailability, WeekDay } from './doctor-availability.entity';
import { Doctor } from './doctor.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { ScheduleType, AvailabilityType } from './doctor-availability.entity';


@Injectable()
export class DoctorAvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private availabilityRepo: Repository<DoctorAvailability>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  /*async create(doctorUserId: string, dto: CreateAvailabilityDto) {
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
    /*if (!date) {
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

    return this.availabilityRepo.save(availability);*
    if (!date) {
   throw new BadRequestException('Date is required');
  }

const scheduleType = dto.scheduleType || ScheduleType.STREAM;
const slotDuration = dto.slotDuration || 15;

const start = new Date(`1970-01-01T${startTime}`);
const end = new Date(`1970-01-01T${endTime}`);

const createdSlots = [];

while (start < end) {
  const next = new Date(start.getTime() + slotDuration * 60000);

  const formattedStart = start.toTimeString().slice(0, 5);
  const formattedEnd = next.toTimeString().slice(0, 5);

  const conflict = await this.availabilityRepo.findOne({
    where: {
      doctor: { id: doctor.id },
      date,
      startTime: LessThan(formattedEnd),
      endTime: MoreThan(formattedStart),
    },
  });

  if (!conflict) {
    const availability = this.availabilityRepo.create({
      doctor,
      date,
      startTime: formattedStart,
      endTime: formattedEnd,
      maxPatients:
        scheduleType === ScheduleType.WAVE
          ? maxPatients || 5
          : 1,
      scheduleType,
      slotDuration,
    });

    createdSlots.push(await this.availabilityRepo.save(availability));
  }

  start.setMinutes(start.getMinutes() + slotDuration);
}

/*return {
  message: `${scheduleType} slots created`,
  slots: createdSlots.length,
};*
return {
  message: 'Availability created',
  doctorId: doctor.id,
  scheduleType,
  date,
  maxPatients: maxPatients || (scheduleType === ScheduleType.WAVE ? 5 : 1),
  totalSlots: createdSlots.length,

  slots: createdSlots.map((slot) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
    booked: slot.bookedCount || 0,
    remaining:
      (slot.maxPatients || 1) - (slot.bookedCount || 0),
  })),
};


  }*/

async create(doctorUserId: string, dto: CreateAvailabilityDto) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: doctorUserId } },
  });

  if (!doctor) throw new BadRequestException('Doctor profile not found');

  const {
    availabilityType = AvailabilityType.CUSTOM,
    date,
    startTime,
    endTime,
    dayOfWeek,
    scheduleType = ScheduleType.STREAM,
    slotDuration = 15,
    maxPatients,
  } = dto;

  if (startTime >= endTime) {
    throw new BadRequestException('Invalid time range');
  }

  // conflict checker
  const isConflict = async (
    targetDate: string,
    sTime: string,
    eTime: string,
  ) => {
    const existing = await this.availabilityRepo.findOne({
      where: {
        doctor: { id: doctor.id },
        date: targetDate,
        startTime: LessThan(eTime),
        endTime: MoreThan(sTime),
      },
    });
    return !!existing;
  }

  // save single STREAM slot
  const createStreamSlot = async (targetDate: string, recurring = false) => {
    if (await isConflict(targetDate, startTime, endTime)) return [];

    const slot = this.availabilityRepo.create({
      doctor,
      availabilityType,
      date: targetDate,
      startTime,
      endTime,
      dayOfWeek,
      isRecurring: recurring,
      scheduleType: ScheduleType.STREAM,
      slotDuration: null,
      maxPatients: maxPatients || 1,
    });

    return [await this.availabilityRepo.save(slot)];
  };

  // create WAVE sub slots
  const createWaveSlots = async (targetDate: string, recurring = false) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    const slots: DoctorAvailability[] = [];

    while (start < end) {
      const next = new Date(start.getTime() + slotDuration * 60000);

      const formattedStart = start.toTimeString().slice(0, 5);
      const formattedEnd = next.toTimeString().slice(0, 5);

      if (!(await isConflict(targetDate, formattedStart, formattedEnd))){
      const slot = this.availabilityRepo.create({
        doctor,
        availabilityType,
        date: targetDate,
        startTime: formattedStart,
        endTime: formattedEnd,
        dayOfWeek,
        isRecurring: recurring,
        scheduleType: ScheduleType.WAVE,
        slotDuration,
        maxPatients: maxPatients || 5,
      });

      slots.push(await this.availabilityRepo.save(slot));
    }
      start.setMinutes(start.getMinutes() + slotDuration);
    }

    return slots;
  };

  const generateSlots = async (targetDate: string, recurring = false) => {
    if (scheduleType === ScheduleType.STREAM) {
      return createStreamSlot(targetDate, recurring);
    }
    return createWaveSlots(targetDate, recurring);
  };

  // ================= CUSTOM =================
  if (availabilityType === AvailabilityType.CUSTOM) {
    if (!date) throw new BadRequestException('Date required');

    const slots = await generateSlots(date);

    if (!slots.length)
      throw new BadRequestException('Slot already exists for this time');

    return this.formatResponse(slots, scheduleType, availabilityType);
  }

  // ================= RECURRING =================
  if (!dayOfWeek) {
    throw new BadRequestException('dayOfWeek required');
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

  const targetDay = weekDayMap[dayOfWeek];
  const today = new Date();
  const weeksToGenerate = 4;

  let allSlots: DoctorAvailability[] = [];

  for (let i = 0; i < weeksToGenerate * 7; i++) {
    const future = new Date();
    future.setDate(today.getDate() + i);

    if (future.getDay() === targetDay) {
      const formattedDate = future.toISOString().split('T')[0];
      const slots = await generateSlots(formattedDate, true);
      allSlots = [...allSlots, ...slots];
    }
  }

  if (!allSlots.length)
    throw new BadRequestException('All recurring slots already exist');

  return this.formatResponse(allSlots, scheduleType, availabilityType);
}

private getSection(startTime: string): string {
  const hour = parseInt(startTime.split(':')[0], 10);

  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

private formatResponse(
  slots: DoctorAvailability[],
  scheduleType: ScheduleType,
  availabilityType: AvailabilityType,
) {
  return slots.map((slot) => ({
    id: slot.id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    section: this.getSection(slot.startTime),
    scheduleType,
    availabilityType,
    slotDuration: slot.slotDuration,
    maxPatients: slot.maxPatients,
    bookedCount: slot.bookedCount,
    doctor: {
      id: slot.doctor.id,
      licenseNumber: slot.doctor.licenseNumber,
      isApproved: slot.doctor.isApproved,
    },
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
    isRecurring: slot.isRecurring,
    isActive: slot.isActive,
  }));
}


}
