import { Controller, Put, Body, UseGuards, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { AuthGuard } from '@nestjs/passport';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  
  @Put('onboarding')
  @UseGuards(AuthGuard('jwt'))
  async completeOnboarding(
    @Request() req,
    @Body() dto: CompleteOnboardingDto,
  ) {
    return this.patientsService.completeOnboarding(
      req.user.id,
      dto,
    );
  }
}
