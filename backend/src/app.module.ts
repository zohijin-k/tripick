import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './common/health/health.module';
import configuration from './config/configuration';
import { CoursesModule } from './courses/courses.module';
import { PrismaModule } from './prisma/prisma.module';
import { TourModule } from './tour/tour.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    AuthModule,
    HealthModule,
    CoursesModule,
    TourModule,
  ],
})
export class AppModule {}
