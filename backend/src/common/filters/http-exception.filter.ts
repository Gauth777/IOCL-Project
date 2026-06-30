import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let errorResponseName = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const resObj = exception.getResponse();
      if (typeof resObj === 'object' && resObj !== null) {
        const responseBody = resObj as ExceptionResponse;
        message = responseBody.message || exception.message;
        errorResponseName = responseBody.error || exception.name;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // Hide detailed error messages in production for unhandled internal exceptions
      if (process.env.NODE_ENV === 'production') {
        message = 'Internal server error';
      }
    }

    // Log the error
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} failed: ${
          exception instanceof Error
            ? exception.stack
            : JSON.stringify(exception)
        }`,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} returned ${status}: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: errorResponseName,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
