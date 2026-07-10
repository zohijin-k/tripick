import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '서버 상태 확인' })
  @ApiOkResponse({ schema: { example: { status: 'ok', service: 'tripick-backend' } } })
  check() {
    return { status: 'ok', service: 'tripick-backend' };
  }
}
