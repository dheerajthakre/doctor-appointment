import { IsNotEmpty } from 'class-validator';

export class ConfirmVerificationDto {
  @IsNotEmpty()
  token: string;
}
