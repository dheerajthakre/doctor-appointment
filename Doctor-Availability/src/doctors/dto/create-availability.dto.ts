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

}
