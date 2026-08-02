import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPrismaClient, type DatabaseClient } from '@alif/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client: DatabaseClient;

  constructor(configService: ConfigService) {
    this.client = createPrismaClient(
      configService.getOrThrow<string>('DATABASE_URL'),
    );
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
