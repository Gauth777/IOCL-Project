import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API service health status' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  getHealth() {
    return this.healthService.getHealth();
  }
}
