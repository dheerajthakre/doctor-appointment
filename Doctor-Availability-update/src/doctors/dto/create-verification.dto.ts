import { IsNotEmpty } from 'class-validator';

export class CreateVerificationDto {
  @IsNotEmpty()
  licenseNumber: string;
}
