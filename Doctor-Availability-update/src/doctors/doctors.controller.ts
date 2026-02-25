import { Controller, Put, Body, UseGuards, Request, Post, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoctorsService } from './doctors.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { CreateSpecializationDto } from './dto/create-specialization.dto';



@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  async updateProfile(@Request() req, @Body() body) {
    return this.doctorsService.updateProfile(req.user.sub, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('verification/send')
  sendVerification(@Request() req, @Body() dto: CreateVerificationDto) {
    return this.doctorsService.sendVerification(req.user.sub, dto);
}

  @UseGuards(AuthGuard('jwt'))
  @Post('verification/confirm')
  confirmVerification(@Request() req, @Body() dto: ConfirmVerificationDto) {
    return this.doctorsService.confirmVerification(req.user.sub, dto.token);
}

  @UseGuards(AuthGuard('jwt'))
  @Post('specializations')
  addSpecialization(@Request() req, @Body() dto: CreateSpecializationDto) {
    return this.doctorsService.addSpecialization(req.user.sub, dto);
}

  @UseGuards(AuthGuard('jwt'))
  @Get('specializations')
  getMySpecializations(@Request() req) {
    return this.doctorsService.getMySpecializations(req.user.sub);
}
}
