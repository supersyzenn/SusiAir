import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { corsOrigins } from './common/cors-origins';
export function configureApp(app:INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ transform:true,whitelist:true,forbidNonWhitelisted:true,forbidUnknownValues:false }));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableCors({ origin:corsOrigins(process.env.CORS_ORIGINS || 'http://localhost:3000',process.env.NODE_ENV),methods:['GET','POST','OPTIONS'],allowedHeaders:['Content-Type','Authorization'] });
}
