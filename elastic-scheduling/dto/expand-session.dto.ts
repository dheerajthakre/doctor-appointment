import { IsDateString, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class ExpandSessionDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  newStartTime?: string;

  @IsOptional()
  @IsString()
  newEndTime?: string;

  @IsInt()
  @Min(5)
  consultationDuration: number;

  @IsInt()
  @Min(1)
  waveCapacity: number;
}
