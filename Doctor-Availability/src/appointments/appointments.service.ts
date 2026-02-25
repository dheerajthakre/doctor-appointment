import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { DoctorAvailability } from '../doctors/doctor-availability.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,

    @InjectRepository(DoctorAvailability)
    private slotRepo: Repository<DoctorAvailability>,
  ) {}

  async bookAppointment(patientUserId: string, dto: any) {
    const patient = await this.patientRepo.findOne({
      where: { user: { id: patientUserId } },
      relations: ['user'],
    });

    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.doctorRepo.findOne({
      where: { id: dto.doctorId },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const slot = await this.slotRepo.findOne({
      where: { id: dto.slotId },
      relations: ['doctor'],
    });

    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.bookedCount >= slot.maxPatients)
      throw new BadRequestException('Slot is full');

    // prevent double booking
    const existing = await this.appointmentRepo.findOne({
      where: {
        patient: { id: patient.id },
        slot: { id: slot.id },
        status: AppointmentStatus.CONFIRMED,
      },
    });

    if (existing)
      throw new BadRequestException('Already booked this slot');

    slot.bookedCount += 1;
    await this.slotRepo.save(slot);

    const appointment = this.appointmentRepo.create({
      patient,
      doctor,
      slot,
    });

    return this.appointmentRepo.save(appointment);
  }

  async getMyAppointments(patientUserId: string) {
    return this.appointmentRepo.find({
      where: {
        patient: { user: { id: patientUserId } },
      },
      relations: ['doctor', 'slot'],
    });
  }

  async cancelAppointment(id: string) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['slot'],
    });

    if (!appointment)
      throw new NotFoundException('Appointment not found');

    if (appointment.status === AppointmentStatus.CANCELLED)
      throw new BadRequestException('Already cancelled');

    appointment.status = AppointmentStatus.CANCELLED;

    appointment.slot.bookedCount -= 1;
    await this.slotRepo.save(appointment.slot);

    return this.appointmentRepo.save(appointment);
  }
}
