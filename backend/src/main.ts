import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // 개발: origin 설정이 없으면 전체 허용(RN 실기기/시뮬레이터, 웹 MVP 모두 접근 가능).
  // 배포: CORS_ORIGINS 환경변수로 허용 도메인을 제한한다.
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TRIPICK Backend API')
    .setDescription('TRIPICK NestJS 백엔드 — TourAPI 프록시 및 헬스체크')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`TRIPICK Backend running on http://localhost:${port}/api (docs: http://localhost:${port}/api-docs)`);
}

bootstrap();
