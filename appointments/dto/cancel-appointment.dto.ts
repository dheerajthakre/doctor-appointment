import { IsUUID } from 'class-validator';

export class CancelAppointmentDto {
  @IsUUID()
  appointmentId: string;
}
