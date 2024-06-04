import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AddressType } from './user-address-book.entity';

export class CreateUserAddressDto {
  @ApiProperty()
  @IsOptional()
  first_name: string;

  @ApiProperty()
  @IsOptional()
  last_name: string;

  @ApiProperty()
  @IsOptional()
  phone_number_1: string;

  @ApiProperty()
  @IsOptional()
  phone_number_2: string;

  @ApiProperty()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsOptional()
  city: string;

  @ApiProperty()
  @IsOptional()
  state: string;

  @ApiProperty()
  @IsOptional()
  postal_code: string;

  @ApiProperty()
  @IsOptional()
  country_id: string;

  @ApiProperty()
  @IsOptional()
  latitude: number;

  @ApiProperty()
  @IsOptional()
  longitude: number;

  @ApiProperty()
  @IsOptional()
  notes: string;

  @ApiProperty()
  @IsOptional()
  // @IsEnum(AddressType)
  // address_type: AddressType;
  @IsEnum(AddressType, { message: 'Invalid address type' })
  address_type: AddressType;

  @ApiProperty()
  @IsOptional()
  is_default: boolean;
}
