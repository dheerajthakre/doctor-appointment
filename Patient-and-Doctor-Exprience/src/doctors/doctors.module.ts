import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { Profile } from './profile.entity';
import { Specialization } from './specialization.entity';
import { VerificationToken } from './verification-token.entity';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      Profile,
      Specialization,
      VerificationToken,
    ]),
  ],
  providers: [DoctorsService],
  controllers: [DoctorsController],
})
export class DoctorsModule {}
