import { IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  doctorId: string;

  @IsUUID()
  slotId: string;
}
