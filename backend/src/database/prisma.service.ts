/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

// If PrismaClient throws on instantiation (because no models are defined),
// we fallback to a mock class so the application doesn't crash during the foundation stage.
let BaseClass: new (...args: any[]) => PrismaClient;
try {
  new PrismaClient();
  BaseClass = PrismaClient as any;
} catch (e) {
  BaseClass = class {
    constructor() {}
    async $connect() {}
    async $disconnect() {}
  } as any;
}

@Injectable()
export class PrismaService extends BaseClass implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (databaseUrl) {
      try {
        super({
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        });
      } catch (e) {
        super();
      }
    } else {
      super();
    }
    this.configService = configService;
  }

  async onModuleInit() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      this.logger.warn(
        'DATABASE_URL is not configured. Prisma will not attempt to connect to the database.',
      );
      return;
    }

    try {
      await (this as any).$connect();
      this.logger.log('Successfully connected to the database.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to connect to the database. The application will continue running without database connectivity. Error: ${errorMessage}`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await (this as any).$disconnect();
      this.logger.log('Disconnected from the database.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error disconnecting from the database: ${errorMessage}`);
    }
  }
}
