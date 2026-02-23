import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Appointment, AppointmentStatus } from './appointment.entity';
import { DoctorAvailability } from '../doctors/doctor-availability.entity';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctor.entity';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { RescheduleHistory } from './reschedule-history.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,

    @InjectRepository(DoctorAvailability)
    private slotRepo: Repository<DoctorAvailability>,

    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(RescheduleHistory)
    private rescheduleRepo: Repository<RescheduleHistory>,

  ) {}

  // BOOK APPOINTMENT (PATIENT)
  async book(userId: string, dto: BookAppointmentDto) {
    const patient = await this.patientRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    const slot = await this.slotRepo.findOne({
      where: { id: dto.slotId },
      relations: ['doctor'],
    });

    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.bookedCount >= slot.maxPatients) {
      throw new BadRequestException('Slot is full');
    }

    const appointmentDateTime = new Date(
      `${slot.date}T${slot.startTime}`,
    );

    const appointment = this.appointmentRepo.create({
      doctor: slot.doctor,
      patient,
      slot,
      appointmentDate: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      appointmentDateTime,
    });

    slot.bookedCount += 1;

    await this.slotRepo.save(slot);
    const saved = await this.appointmentRepo.save(appointment);

    return {
      message: 'Appointment booked successfully',
      appointment: saved,
    };
  }

  // PATIENT APPOINTMENTS
  async getMyAppointments(userId: string) {
    const patient = await this.patientRepo.findOne({
      where: { user: { id: userId } },
    });

    return this.appointmentRepo.find({
      where: { patient: { id: patient.id } },
      order: { appointmentDate: 'DESC' },
    });
  }

  //  PATIENT CANCEL
  async cancelByPatient(userId: string, appointmentId: string) {
    console.log('appointmentId:', appointmentId);

    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['patient', 'patient.user', 'slot'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.patient.user.id !== userId) {
      throw new ForbiddenException();
    }

    appointment.status = AppointmentStatus.CANCELLED;

    appointment.slot.bookedCount -= 1;
    await this.slotRepo.save(appointment.slot);

    await this.appointmentRepo.save(appointment);

    return { message: 'Appointment cancelled' };
  }

  //  DOCTOR VIEW
  async getDoctorAppointments(userId: string) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
    });

    return this.appointmentRepo.find({
      where: { doctor: { id: doctor.id } },
      order: { appointmentDate: 'DESC' },
    });
  }

  //  DOCTOR CANCEL
  async cancelByDoctor(userId: string, appointmentId: string) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
    });

    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['doctor', 'slot'],
    });

    if (appointment.doctor.id !== doctor.id) {
      throw new ForbiddenException();
    }

    appointment.status = AppointmentStatus.CANCELLED;

    appointment.slot.bookedCount -= 1;
    await this.slotRepo.save(appointment.slot);

    await this.appointmentRepo.save(appointment);

    return { message: 'Appointment cancelled by doctor' };
  }
// Reschedule
  async rescheduleAppointment(
  userId: string,
  appointmentId: string,
  dto: RescheduleAppointmentDto,
) {
  const patient = await this.patientRepo.findOne({
    where: { user: { id: userId } },
  });

  const appointment = await this.appointmentRepo.findOne({
    where: { id: appointmentId },
    relations: ['patient', 'slot'],
  });

  if (!appointment) throw new NotFoundException('Appointment not found');

  if (appointment.patient.id !== patient.id)
    throw new ForbiddenException();

  if (appointment.status !== AppointmentStatus.BOOKED)
    throw new BadRequestException('Only booked appointments can be rescheduled');

  const newSlot = await this.slotRepo.findOne({
    where: { id: dto.newSlotId },
    relations: ['doctor'],
  });

  if (!newSlot) throw new NotFoundException('New slot not found');

  if (newSlot.bookedCount >= newSlot.maxPatients)
    throw new BadRequestException('Slot is full');

  // ✅ release old slot
  appointment.slot.bookedCount -= 1;
  await this.slotRepo.save(appointment.slot);

  // ✅ book new slot
  newSlot.bookedCount += 1;
  await this.slotRepo.save(newSlot);

  // ✅ save history
  await this.rescheduleRepo.save({
    appointment,
    oldDateTime: appointment.appointmentDateTime,
    newDateTime: new Date(`${newSlot.date}T${newSlot.startTime}`),
    reason: dto.reason,
  });

  // ✅ update appointment
  appointment.slot = newSlot;
  appointment.appointmentDate = newSlot.date;
  appointment.startTime = newSlot.startTime;
  appointment.endTime = newSlot.endTime;
  appointment.appointmentDateTime = new Date(
    `${newSlot.date}T${newSlot.startTime}`,
  );
  appointment.rescheduleCount += 1;

  return this.appointmentRepo.save(appointment);
}


}
