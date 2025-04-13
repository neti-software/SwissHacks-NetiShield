import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VendorEntity, VendorsSelect } from './vendors.entity';
import {
  VendorVerificationStatusLogEntity,
  VendorVerificationStatusLogSelect,
} from './vendor-verification-status-log.entity';

export const VendorVerificationSelect = {
  id: true,
  vendor: {
    select: VendorsSelect,
  },
  currentStatus: {
    select: VendorVerificationStatusLogSelect,
  },
  statusLog: {
    orderBy: {
      createdAt: 'desc',
    },
    select: VendorVerificationStatusLogSelect,
  },
  subjectAddress: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VendorVerificationSelect;

export class VendorVerificationEntity {
  @ApiProperty({
    description: 'Vendor verification ID',
    example: 'cbad99d7-3cce-4e9c-9d4d-099189441c99',
  })
  id: string;

  @ApiProperty({
    description: 'Vendor that performed verification',
    type: VendorEntity,
  })
  @Type(() => VendorEntity)
  vendor: VendorEntity;

  @ApiProperty({
    description: 'Current verification status',
    type: VendorVerificationStatusLogEntity,
  })
  @Type(() => VendorVerificationStatusLogEntity)
  currentStatus: VendorVerificationStatusLogEntity | null;

  @ApiProperty({
    description: 'Verification status history',
    type: [VendorVerificationStatusLogEntity],
  })
  @Type(() => VendorVerificationStatusLogEntity)
  statusLog: VendorVerificationStatusLogEntity[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-03-25T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-03-25T12:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Subject address',
    example: 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV',
  })
  subjectAddress: string;

  constructor(
    verification: Prisma.VendorVerificationGetPayload<{
      select: typeof VendorVerificationSelect;
    }>,
  ) {
    this.id = verification.id;
    this.vendor = new VendorEntity(verification.vendor);
    this.currentStatus = verification.currentStatus;
    this.statusLog = verification.statusLog;
    this.createdAt = verification.createdAt;
    this.updatedAt = verification.updatedAt;
    this.subjectAddress = verification.subjectAddress;
  }
}
