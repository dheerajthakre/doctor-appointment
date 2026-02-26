import {
  Controller,
  Body,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ElasticSchedulingService } from './elastic-scheduling.service';
import { ExpandSessionDto } from './dto/expand-session.dto';
import { ShrinkSessionDto } from './dto/shrink-session.dto';

@Controller('elastic-scheduling')
@UseGuards(JwtAuthGuard)
export class ElasticSchedulingController {
  constructor(
    private readonly elasticService: ElasticSchedulingService, //  INJECT
  ) {}

  @Patch('expand')
  expand(@Req() req, @Body() dto: ExpandSessionDto) {
    return this.elasticService.expandSession(req.user.id, dto);
  }
}