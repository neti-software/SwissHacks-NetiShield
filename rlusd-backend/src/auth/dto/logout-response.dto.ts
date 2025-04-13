import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Success status of the logout operation',
    example: true,
  })
  success: boolean;
}
