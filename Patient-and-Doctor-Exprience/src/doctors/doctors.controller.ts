import { Controller, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  async updateProfile(@Request() req, @Body() body) {
    return this.doctorsService.updateProfile(req.user.sub, body);
  }
}
