import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Doctor, (doctor) => doctor.profile)
  @JoinColumn()
  doctor: Doctor;

  @Column({ nullable: true })
  experience: number;

  @Column({ nullable: true })
  consultationHours: string;

  @Column({ type: 'text', nullable: true })
  bio: string;
}
