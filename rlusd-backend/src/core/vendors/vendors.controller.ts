import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { VendorEntity } from '@infra/prisma/entities/vendors.entity';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active vendors' })
  @ApiResponse({
    status: 200,
    description: 'List of all active vendors',
    type: [VendorEntity],
  })
  async getAllVendors(): Promise<VendorEntity[]> {
    return this.vendorsService.findAll();
  }
}
