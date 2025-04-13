import { BaseVendor } from './base.vendor';

export class PercentageChanceForSuccessVendor extends BaseVendor {
  private chance: number;

  constructor(chance: number) {
    super();
    this.chance = chance;
  }

  async isAddressSafe(): Promise<boolean> {
    return Math.random() < this.chance;
  }
}
