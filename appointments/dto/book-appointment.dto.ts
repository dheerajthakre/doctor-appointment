import { IsUUID } from 'class-validator';

export class BookAppointmentDto {
  @IsUUID()
  slotId: string;
}
