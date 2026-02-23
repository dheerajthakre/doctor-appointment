import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';

export enum WeekDay {
  SUNDAY = 'sunday',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
}

export enum AvailabilityType {
  CUSTOM = 'custom',
  RECURRING = 'recurring',
}

export enum ScheduleType{
  STREAM = 'stream',
  WAVE = 'wave',
}

@Entity('doctor_availabilities')
export class DoctorAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.availabilities, {
    onDelete: 'CASCADE',
  })
  doctor: Doctor;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({
    type: 'enum',
    enum: WeekDay,
    nullable: true,
  })
  dayOfWeek: WeekDay;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int', default: 1 })
  maxPatients: number;

  @Column({ type: 'int', default: 0 })
  bookedCount: number;

  @Column({
    type: 'enum',
    enum: ScheduleType,
    default: ScheduleType.STREAM,
  })
  scheduleType: ScheduleType;

  @Column({ type: 'int', nullable: true })
  slotDuration: number; // in minutes

  @Column({
  type: 'enum',
  enum: AvailabilityType,
  default: AvailabilityType.CUSTOM,
  })
  availabilityType: AvailabilityType;

}
