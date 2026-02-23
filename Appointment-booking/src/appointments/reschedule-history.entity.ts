import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity()
export class RescheduleHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, (a) => a.rescheduleHistory, {
    onDelete: 'CASCADE',
  })
  appointment: Appointment;

  @Column()
  oldDateTime: Date;

  @Column()
  newDateTime: Date;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
