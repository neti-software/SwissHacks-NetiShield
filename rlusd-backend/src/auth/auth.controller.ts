import { Controller, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { Request } from 'express';
import { XrplLoginDto } from './dto/xrpl-login.dto';
import { XrplLoginPayloadDto } from './dto/xrpl-login-payload.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/xrpl/create')
  @ApiOperation({ summary: 'Create an XRPL login request for Xaman wallet' })
  @ApiResponse({
    status: 201,
    description: 'XRPL login request created successfully',
    type: XrplLoginPayloadDto,
  })
  async createXrplLogin(): Promise<XrplLoginPayloadDto> {
    return this.authService.createXrplLoginRequest();
  }

  @Post('login/xrpl/verify')
  @ApiOperation({ summary: 'Verify an XRPL login request' })
  @ApiBody({ type: XrplLoginDto })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully logged in with XRPL',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async loginWithXrpl(@Body() loginDto: XrplLoginDto, @Req() request: Request): Promise<LoginResponseDto> {
    const verificationResult = await this.authService.verifyXrplLogin(loginDto.uuid);

    if (!verificationResult.success || !verificationResult.walletAddress) {
      throw new HttpException('XRPL login verification failed', HttpStatus.UNAUTHORIZED);
    }

    const walletAddress = verificationResult.walletAddress;

    request.session.walletAddress = walletAddress;

    await new Promise<void>((resolve) => {
      request.session.save(resolve);
    });

    return {
      walletAddress,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully logged out',
    type: LogoutResponseDto,
  })
  async logout(@Req() request: Request): Promise<LogoutResponseDto> {
    return new Promise<LogoutResponseDto>((resolve) => {
      request.session.destroy((err) => {
        if (err) {
          resolve({ success: false });
        } else {
          resolve({ success: true });
        }
      });
    });
  }
}
