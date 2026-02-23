import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { DoctorAvailability } from '../doctors/doctor-availability.entity';
import { RescheduleHistory } from './reschedule-history.entity';


export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { eager: true })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appointments, { eager: true })
  patient: Patient;

  @ManyToOne(() => DoctorAvailability, { eager: true })
  slot: DoctorAvailability;

  @Column({ type: 'date' })
  appointmentDate: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.BOOKED,
  })
  status: AppointmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  appointmentDateTime: Date;

  @Column({ default: 0 })
  rescheduleCount: number;

  @OneToMany(
    () => RescheduleHistory,
    (history) => history.appointment,
  )
  rescheduleHistory: RescheduleHistory[];

}
