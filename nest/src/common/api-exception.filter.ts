import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : 500;
    const response = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = typeof response === 'object' && response && 'message' in response
      ? response.message : statusCode === 500 ? 'An unexpected error occurred' : response || 'Request failed';
    if (statusCode >= 500) this.logger.error(exception);
    const codes: Record<number,string> = {400:'BAD_REQUEST',401:'UNAUTHORIZED',403:'FORBIDDEN',404:'NOT_FOUND',429:'TOO_MANY_REQUESTS'};
    res.status(statusCode).json({ statusCode, code:codes[statusCode] || 'INTERNAL_ERROR', message, path:req.path });
  }
}
