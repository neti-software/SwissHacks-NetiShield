import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({
    description: 'The name of the vendor',
    example: 'Blowfish',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The description of the vendor',
    example: 'Blowfish fraud prevention service',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
