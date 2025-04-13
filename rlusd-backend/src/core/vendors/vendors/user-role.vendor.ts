import { BaseVendor } from './base.vendor';

export class UserRoleVendor extends BaseVendor {
  private failFor: 'recipient' | 'sender';

  constructor(failFor: 'recipient' | 'sender') {
    super();
    this.failFor = failFor;
  }

  async isAddressSafe(address: string, role: 'recipient' | 'sender'): Promise<boolean> {
    if (role === this.failFor) {
      return false;
    }
    return true;
  }
}
