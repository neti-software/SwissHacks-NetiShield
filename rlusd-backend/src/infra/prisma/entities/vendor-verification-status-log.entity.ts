import { ApiProperty } from '@nestjs/swagger';
import { Prisma, VendorVerificationStatus } from '@prisma/client';

export const VendorVerificationStatusLogSelect = {
  id: true,
  status: true,
  createdAt: true,
} satisfies Prisma.VendorVerificationStatusLogSelect;

export class VendorVerificationStatusLogEntity {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({
    description: 'Verification status',
    enum: VendorVerificationStatus,
    example: VendorVerificationStatus.PENDING,
  })
  status: VendorVerificationStatus;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-03-25T12:00:00Z',
  })
  createdAt: Date;

  constructor(
    statusLog: Prisma.VendorVerificationStatusLogGetPayload<{
      select: typeof VendorVerificationStatusLogSelect;
    }>,
  ) {
    this.status = statusLog.status;
    this.createdAt = statusLog.createdAt;
  }
}
