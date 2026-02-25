import { IsUUID, IsString, IsOptional } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsUUID()
  newSlotId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
