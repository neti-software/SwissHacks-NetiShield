import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class XrplLoginDto {
  @ApiProperty({
    description: 'UUID of the XRPL login payload to verify',
    example: '5a8af3b5-4c1a-4b5a-b8d5-7c3f1d5f8a7c',
  })
  @IsString()
  @IsNotEmpty()
  uuid: string;
}
