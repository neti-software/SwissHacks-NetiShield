import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Parameter decorator that extracts the authenticated wallet address from the request session
 */
export const WalletAddress = createParamDecorator(
  (data: { required?: boolean } = { required: true }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const walletAddress = request.session?.walletAddress;

    if (data.required && !walletAddress) {
      throw new UnauthorizedException('Authentication required');
    }

    return walletAddress;
  },
);
