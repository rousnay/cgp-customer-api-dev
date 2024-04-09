import { ApiProperty } from '@nestjs/swagger';
import { Customers } from '../entities/customers.entity';

export class CustomerPagedResponseDto {
  @ApiProperty({ description: 'Total number of customers' })
  totalCount: number;

  @ApiProperty({ description: 'Current page' })
  currentPage: number;

  @ApiProperty({ description: 'Current limit' })
  currentLimit: number;

  @ApiProperty({ description: 'List of customers' })
  data: Customers[];
}
