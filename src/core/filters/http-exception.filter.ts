import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
// import { ValidationException } from './validation.exception';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let errorResponse: any = {
      statusCode: status,
      message: exceptionResponse['message'] || exception.message,
      error: exceptionResponse['error'] || null,
    };

    if (exceptionResponse instanceof Array) {
      // This is a validation error
      errorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: this.flattenValidationErrors(exceptionResponse),
      };
    }

    response.status(status).json(errorResponse);
  }

  private flattenValidationErrors(validationErrors: ValidationError[]) {
    return validationErrors.map((error) => {
      return Object.values(error.constraints).join(', ');
    });
  }
}
