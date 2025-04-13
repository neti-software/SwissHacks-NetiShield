import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export const VendorsSelect = {
  id: true,
  name: true,
  description: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VendorSelect;

export class VendorEntity {
  id: string;

  @ApiProperty({
    description: 'Vendor name',
    example: 'Vendor 1',
  })
  name: string;

  @ApiProperty({
    description: 'Vendor description',
    example: 'Vendor 1 description',
  })
  description: string | null;

  @ApiProperty({
    description: 'Transaction amount',
    example: 100,
  })
  active: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-03-25T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-03-25T12:00:00Z',
    nullable: true,
  })
  updatedAt: Date | null;

  constructor(vendor: Prisma.VendorGetPayload<{ select: typeof VendorsSelect }>) {
    this.id = vendor.id;
    this.name = vendor.name;
    this.description = vendor.description;
    this.active = vendor.active;
    this.createdAt = vendor.createdAt;
    this.updatedAt = vendor.updatedAt;
  }
}
