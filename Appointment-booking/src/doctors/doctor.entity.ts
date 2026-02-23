import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Profile } from './profile.entity';
import { Specialization } from './specialization.entity';
import { VerificationToken } from './verification-token.entity';
import { DoctorAvailability } from './doctor-availability.entity';
import { Appointment } from '../appointments/appointment.entity';



@Entity('doctors')
export class Doctor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @Column({ nullable: true })
    licenseNumber: string;

    @Column({ default: false })
    isApproved: boolean;

    @OneToOne(() => Profile, (profile) => profile.doctor)
    profile: Profile;

    @OneToMany(() => Specialization, (spec) => spec.doctor)
    specializations: Specialization[];

    @OneToMany(() => VerificationToken, (token) => token.doctor)
    verificationTokens: VerificationToken[];

    @OneToMany(() => DoctorAvailability, (availability) => availability.doctor,)
    availabilities: DoctorAvailability[];

    @OneToMany(() => Appointment, (appointment) => appointment.doctor)
    appointments: Appointment[];

}