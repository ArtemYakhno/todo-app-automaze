import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { getCorsConfig } from '../configs/cors.config';
import { validationConfig } from '../configs/validation.config';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { setupSwagger } from './swagger.setup';

export function setupApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  app.enableCors(getCorsConfig(configService));
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe(validationConfig));
  setupSwagger(app);
}
