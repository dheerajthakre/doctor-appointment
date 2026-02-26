import { IsUUID, IsString, IsDateString, IsOptional, IsMilitaryTime, IsInt, Min } from 'class-validator';

export class ShrinkSessionDto {
  @IsUUID()
  slotId: string;

  @IsDateString()
  date: string;

  @IsString()
  availabilityId: string;

  @IsOptional()
  @IsMilitaryTime()
  newStartTime?: string;

  @IsOptional()
  @IsMilitaryTime()
  newEndTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  newSlotDuration?: number; // consultation time shrink
}
