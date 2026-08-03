import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { parseRedisUrl } from '@alif/config';
import { QUEUE_KEY_PREFIX } from '@alif/contracts';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        prefix: QUEUE_KEY_PREFIX,
        connection: {
          ...parseRedisUrl(configService.getOrThrow<string>('REDIS_URL')),
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueInfrastructureModule {}
