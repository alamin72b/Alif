import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const DEFAULT_API_HOST = '127.0.0.1';
const DEFAULT_API_PORT = 3001;

function readApiPort(value: string | undefined): number {
  if (value === undefined) {
    return DEFAULT_API_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(
      `API_PORT must be an integer between 1 and 65535. Received: ${value}`,
    );
  }

  return port;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const host = process.env.API_HOST?.trim() || DEFAULT_API_HOST;
  const port = readApiPort(process.env.API_PORT);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  await app.listen(port, host);

  Logger.log(`API running at http://${host}:${port}/api`, 'Bootstrap');
}

void bootstrap();
