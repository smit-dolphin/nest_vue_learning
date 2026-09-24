import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const response = exceptionResponse as any;

        const rawMessage = response.message;

        if (typeof rawMessage === 'string') {
          message = rawMessage;
        } else if (Array.isArray(rawMessage)) {
          message = rawMessage.join(', ');
        } else {
          message = 'Request failed';
        }
      }
    }

    res.status(status).json({
      status,
      message,
      success: false,
    });
  }
}