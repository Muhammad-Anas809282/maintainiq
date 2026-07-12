import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './decorators/current-user.decorator';
import type { GoogleProfile } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  // Public self-registration — always a TECHNICIAN. Privileged roles
  // (ADMIN/SUPERVISOR) can only be created by an existing ADMIN below.
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto, UserRole.TECHNICIAN);
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  // Starts the Google OAuth handshake — the guard redirects to Google.
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {
    // Intentionally empty: GoogleAuthGuard handles the redirect.
  }

  // Google redirects back here after consent. We issue our own JWT and
  // hand off to the frontend via a one-time query param (full-page redirect,
  // since this response comes from Google — not a fetch we control).
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as GoogleProfile;
    const result = await this.auth.oauthLogin(profile);
    const frontend =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    res.redirect(
      `${frontend.replace(/\/$/, '')}/auth/callback?token=${result.accessToken}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  // Admin-only: create a user with any role (technician, supervisor, admin).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('users')
  createUser(@Body() dto: RegisterDto) {
    return this.auth.register(dto, dto.role ?? UserRole.TECHNICIAN);
  }
}
