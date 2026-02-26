import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';

@Entity()
export class ElasticSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, doctor => doctor.elasticSlots)
  doctor: Doctor;

  @Column()
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  capacity: number;
}
