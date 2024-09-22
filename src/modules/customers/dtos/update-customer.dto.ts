import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MaxLength,
  IsOptional,
  IsDateString,
  IsEmpty,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
// import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { Gender } from '@common/enums/user.enum';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Date format must be a valid ISO 8601 date string' },
  )
  @ApiProperty({
    description: 'Format: YYYY-MM-DD',
    type: Date,
    required: false,
  })
  date_of_birth?: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    required: false,
  })
  gender?: Gender | null;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile image',
    required: false,
  })
  profile_image?: Express.Multer.File;

  @IsOptional()
  profile_image_url?: string;

  @IsOptional()
  profile_image_cf_media_id?: number;
}
