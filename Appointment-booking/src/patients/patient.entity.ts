import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from '../users/user.entity';
import { PatientProfile } from './patient-profile.entity';
import { Appointment } from '../appointments/appointment.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ default: false })
  isOnboarded: boolean;

 @OneToOne(() => PatientProfile, (profile) => profile.patient, {
  cascade: true,

})
@JoinColumn()
profile: PatientProfile;

@OneToMany(() => Appointment, (appointment) => appointment.patient)
appointments: Appointment[];
}
