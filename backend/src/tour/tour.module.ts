import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';

@Module({
  imports: [HttpModule.register({ timeout: 8000 })],
  controllers: [TourController],
  providers: [TourService],
})
export class TourModule {}
