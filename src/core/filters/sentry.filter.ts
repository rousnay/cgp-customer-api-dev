import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const requestInfo = {
      headers: request?.headers,
      query: request?.query,
      params: request?.params,
      body: request?.body,
    };

    const responseInfo = {
      headers: response?.getHeaders(),
    };

    const userInfo = {
      id: request?.user?.id,
      name: request?.user?.first_name + ' ' + request?.user?.last_name,
      email: request?.user?.email,
      phone: request?.user?.phone,
    };

    const exceptionName = exception.constructor.name;

    if (exception instanceof HttpException) {
      const responseContent = exception.getResponse();

      Sentry.captureException(exception, {
        tags: {
          exceptionName: exceptionName,
          exceptionType: 'HttpException',
          exceptionStatus: exception.getStatus(),
          rider_id: request?.user?.id,
        },
        extra: {
          requestInfo: requestInfo,
          responseInfo: responseInfo,
          errorDetails: responseContent,
        },
        user: {
          ...userInfo,
        },
        level: 'error',
      });
    } else {
      Sentry.captureException(exception, {
        tags: {
          exceptionName: exceptionName,
          exceptionType: 'Not-HttpException',
          // exceptionStatus: 500,
          rider_id: request?.user?.id,
        },
        extra: {
          requestInfo: requestInfo,
          responseInfo: responseInfo,
        },
        user: {
          ...userInfo,
        },
        level: 'error',
      });
    }

    super.catch(exception, host);
  }
}
