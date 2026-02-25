import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto'

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private service: AppointmentsService) {}

  @Post('book')
  book(@Req() req, @Body() dto: BookAppointmentDto) {
    return this.service.book(req.user.id, dto);
  }

  @Get('my')
  getMy(@Req() req) {
    return this.service.getMyAppointments(req.user.id);
  }

  @Patch(':Id/cancel')
  cancel(@Req() req, @Param('id') id: string) {
    console.log('ID RECEIVED:', id);
    return this.service.cancelByPatient(req.user.id, id);
  }

  @Get('doctor')
  getDoctor(@Req() req) {
    return this.service.getDoctorAppointments(req.user.id);
  }

  @Patch('doctor/cancel/:appointmentId')
  cancelByDoctor(@Req() req, @Param('id') id: string) {
    return this.service.cancelByDoctor(req.user.id, id);
  }

  @Patch(':Id/reschedule')
  reschedule(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.service.rescheduleAppointment(req.user.id, id, dto);
}

}
