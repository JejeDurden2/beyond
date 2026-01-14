import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        // If REDIS_URL is provided (Railway format), parse it
        if (redisUrl) {
          const url = new URL(redisUrl);
          return {
            connection: {
              host: url.hostname,
              port: parseInt(url.port, 10) || 6379,
              password: url.password || undefined,
              username: url.username || undefined,
              family: 0, // Enable dual-stack lookup (IPv4 + IPv6) for Railway compatibility
            },
            defaultJobOptions: {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 1000,
              },
              removeOnComplete: {
                age: 24 * 3600, // Keep completed jobs for 24 hours
                count: 1000,
              },
              removeOnFail: {
                age: 7 * 24 * 3600, // Keep failed jobs for 7 days
              },
            },
          };
        }

        // Fallback to individual environment variables
        return {
          connection: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD'),
            family: 0, // Enable dual-stack lookup (IPv4 + IPv6) for Railway compatibility
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: {
              age: 24 * 3600, // Keep completed jobs for 24 hours
              count: 1000,
            },
            removeOnFail: {
              age: 7 * 24 * 3600, // Keep failed jobs for 7 days
            },
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
