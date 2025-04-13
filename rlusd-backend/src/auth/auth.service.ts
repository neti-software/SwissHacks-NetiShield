import { Injectable, Logger } from '@nestjs/common';
import { XrplService } from '../core/xrpl/xrpl.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly xrplService: XrplService) {}

  /**
   * Create an XRPL login request via Xaman
   * @returns Login payload with QR code data
   */
  async createXrplLoginRequest() {
    try {
      return await this.xrplService.createLoginPayload();
    } catch (error) {
      this.logger.error('Failed to create XRPL login request', error);
      throw error;
    }
  }

  /**
   * Verify and validate an XRPL login
   * @param uuid The payload UUID to verify
   * @returns Verified wallet address if successful
   */
  async verifyXrplLogin(uuid: string) {
    try {
      // Get the verification result from XRPL service
      const verificationResult = await this.xrplService.verifyLoginPayload(uuid);

      if (!verificationResult.success || !verificationResult.walletAddress) {
        throw new Error('XRPL login verification failed');
      }

      // Validate the wallet address is a valid XRPL account
      await this.validateXrplAccount(verificationResult.walletAddress);

      return {
        success: true,
        walletAddress: verificationResult.walletAddress,
      };
    } catch (error) {
      this.logger.error('XRPL login verification failed', error);
      return {
        success: false,
        walletAddress: null,
      };
    }
  }

  /**
   * Validate an XRPL account exists and is active
   * @param walletAddress XRPL wallet address to validate
   */
  private async validateXrplAccount(walletAddress: string): Promise<void> {
    try {
      // Check if the account exists on the XRPL
      await this.xrplService.getAccountInfo(walletAddress);
    } catch (error) {
      this.logger.error(`Invalid or inactive XRPL wallet address: ${walletAddress}`, error);
      throw new Error('Invalid XRPL wallet address');
    }
  }
}
