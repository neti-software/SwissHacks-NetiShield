import { ApiProperty } from '@nestjs/swagger';

export class XrplLoginPayloadDto {
  @ApiProperty({ description: 'Unique identifier for the login request' })
  uuid: string;

  @ApiProperty({ description: 'URL for the QR code to be scanned by Xaman wallet' })
  qrUrl: string;

  @ApiProperty({ description: 'WebSocket URL for real-time status updates' })
  webSocketUrl: string;
}
