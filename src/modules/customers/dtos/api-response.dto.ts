// api-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response status (success/error)' })
  status: 'success' | 'error';

  @ApiProperty({ description: 'Total number of customers' })
  totalCount: number;

  @ApiProperty({ description: 'Current page' })
  currentPage: number;

  @ApiProperty({ description: 'Current limit' })
  currentLimit: number;

  @ApiProperty({ description: 'Data payload' })
  data: T;
}
