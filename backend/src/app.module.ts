import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './common/health/health.module';
import configuration from './config/configuration';
import { TourModule } from './tour/tour.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    HealthModule,
    TourModule,
  ],
})
export class AppModule {}
