import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  getHealth() {
    return {
      status: 'ok',
      service: 'projectlink-backend',
      timestamp: new Date().toISOString(),
      uptime: parseFloat(((Date.now() - this.startTime) / 1000).toFixed(2)),
    };
  }
}
