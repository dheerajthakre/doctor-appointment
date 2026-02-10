export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;
}
