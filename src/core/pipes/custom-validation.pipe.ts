import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';

export class CustomValidationPipe extends ValidationPipe {
  protected flattenValidationErrors(
    validationErrors: ValidationError[],
  ): string[] {
    return validationErrors.flatMap((error) =>
      Object.values(error.constraints),
    );
  }

  public createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      const errors = this.flattenValidationErrors(validationErrors);
      return new BadRequestException({
        statusCode: 400,
        message: 'Validation errors occurred',
        error: 'Bad Request',
        errorDetails: errors,
      });

      // return new BadRequestException(errors, {
      //   cause: new Error(),
      //   description: 'Bad Request',

      // });

      //   return new BadRequestException(errors);
    };
  }
}
