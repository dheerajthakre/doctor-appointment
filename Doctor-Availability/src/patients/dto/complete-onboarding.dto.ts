import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class CompleteOnboardingDto {
  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
