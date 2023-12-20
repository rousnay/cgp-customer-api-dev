// api-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response status (success/error)' })
  status: 'success' | 'error';

  @ApiProperty({ description: 'Data payload' })
  data: T;
}