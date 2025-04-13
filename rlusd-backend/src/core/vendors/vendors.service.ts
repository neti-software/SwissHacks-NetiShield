import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { VendorsSelect, VendorEntity } from '@infra/prisma/entities/vendors.entity';
import { BaseVendor } from './vendors/base.vendor';
import { PercentageChanceForSuccessVendor } from './vendors/percentage-chance-for-success.vendor';
import { UserRoleVendor } from './vendors/user-role.vendor';

@Injectable()
export class VendorsService {
  private readonly vendors: Record<string, BaseVendor> = {
    Chainalsys: new UserRoleVendor('sender'),
    Blowfish: new UserRoleVendor('recipient'),
    Elliptic: new PercentageChanceForSuccessVendor(100),
  };

  constructor(private prisma: PrismaService) {}

  async findAll() {
    const vendors = await this.prisma.vendor.findMany({
      where: { active: true },
      select: VendorsSelect,
    });

    return vendors.map((vendor) => new VendorEntity(vendor));
  }

  async isAddressSafe(vendorName: string, address: string, role: 'recipient' | 'sender'): Promise<boolean> {
    const vendor = this.vendors[vendorName];
    if (!vendor) {
      throw new NotFoundException(`Vendor ${vendorName} not found`);
    }
    return vendor.isAddressSafe(address, role);
  }
}
