import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';

type ExceptionResponseBody = {
  error?: string;
  message?: string | string[];
};

type ExceptionContext = {
  exceptionResponse: ExceptionResponseBody | string | null;
  statusCode: number;
};

type ResponseDetails = {
  responseError: string | undefined;
  responseMessage: string | string[] | undefined;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly isProduction: boolean) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const { statusCode, exceptionResponse } =
      this.getExceptionContext(exception);
    const { responseMessage, responseError } =
      this.extractResponseDetails(exceptionResponse);
    const defaultError = this.getDefaultError(exception);
    const defaultMessage = this.getDefaultMessage(exception);
    const message = this.resolveMessage(
      statusCode,
      responseMessage,
      defaultMessage,
    );

    this.logException(exception);

    response.status(statusCode).send({
      statusCode,
      error: responseError ?? defaultError,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private getExceptionContext(exception: unknown): ExceptionContext {
    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        exceptionResponse: exception.getResponse() as
          | ExceptionResponseBody
          | string,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      exceptionResponse: null,
    };
  }

  private extractResponseDetails(
    exceptionResponse: ExceptionContext['exceptionResponse'],
  ): ResponseDetails {
    if (typeof exceptionResponse === 'string') {
      return {
        responseError: undefined,
        responseMessage: exceptionResponse,
      };
    }

    if (exceptionResponse === null) {
      return {
        responseError: undefined,
        responseMessage: undefined,
      };
    }

    return {
      responseError: exceptionResponse.error,
      responseMessage: exceptionResponse.message,
    };
  }

  private getDefaultError(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.name;
    }

    return 'Internal Server Error';
  }

  private getDefaultMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal Server Error';
  }

  private resolveMessage(
    statusCode: number,
    responseMessage: string | string[] | undefined,
    defaultMessage: string,
  ): string | string[] {
    if (this.isProduction && statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'An unexpected error occurred';
    }

    return responseMessage ?? defaultMessage;
  }

  private logException(exception: unknown): void {
    if (this.isProduction) {
      return;
    }

    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      return;
    }

    this.logger.error('Server error', String(exception));
  }
}
