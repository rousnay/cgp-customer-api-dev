import { Injectable, BadRequestException } from '@nestjs/common';
import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CustomerQueryParamsDto } from './dtos/customer-query-params.dto';

@Injectable()
export class CustomerQueryParamsPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const queryDto = plainToClass(CustomerQueryParamsDto, value);

    const errors = await validate(queryDto, { whitelist: true }); // Using whitelist to strip non-whitelisted properties

    if (errors.length > 0) {
      const errorMessage = errors
        .map((err) => Object.values(err.constraints))
        .join(', ');
      throw new BadRequestException(`Validation failed: ${errorMessage}`);
    }

    return queryDto;
  }
}
