export abstract class BaseVendor {
  abstract isAddressSafe(address: string, role: 'recipient' | 'sender'): Promise<boolean>;
}
