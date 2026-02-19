import {
  IsDateString,
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { WeekDay } from '../doctor-availability.entity';
import { ScheduleType, AvailabilityType } from '../doctor-availability.entity';


export class CreateAvailabilityDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsEnum(WeekDay)
  dayOfWeek?: WeekDay;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxPatients?: number;

  @IsOptional()
  @IsEnum(AvailabilityType)
  availabilityType?: AvailabilityType;

  @IsOptional()
  @IsEnum(ScheduleType)
  scheduleType?: ScheduleType;

  @IsOptional()
  @IsInt()
  @Min(1)
  slotDuration?: number;

}
