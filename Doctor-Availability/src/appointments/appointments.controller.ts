import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  book(@Req() req, @Body() dto: CreateAppointmentDto) {
    return this.service.bookAppointment(req.user.id, dto);
  }

  @Get('me')
  getMine(@Req() req) {
    return this.service.getMyAppointments(req.user.id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancelAppointment(id);
  }
}
