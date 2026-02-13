import { Controller, Put, Body, UseGuards, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Put('onboarding')
  async completeOnboarding(
    @Request() req,
    @Body() body,
  ) {
    return this.patientsService.completeOnboarding(
      req.user.sub,
      body,
    );
  }
}
