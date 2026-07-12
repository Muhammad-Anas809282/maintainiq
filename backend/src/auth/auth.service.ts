import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface AuthResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, role: UserRole): Promise<AuthResult> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.users.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role,
    });

    return this.buildResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildResult(user);
  }

  // Always resolves without revealing whether the email exists (prevents
  // account enumeration). Silently no-ops if the user doesn't exist.
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ ok: true }> {
    const user = await this.users.findByEmail(dto.email);
    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      await this.users.setResetToken(
        user.id,
        tokenHash,
        new Date(Date.now() + RESET_TOKEN_TTL_MS),
      );
      const base =
        this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
      const resetUrl = `${base.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
      await this.mail.passwordReset(user.email, user.name, resetUrl);
    }
    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ ok: true }> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const user = await this.users.findByValidResetToken(tokenHash);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset link');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    await this.users.updatePassword(user.id, passwordHash);
    return { ok: true };
  }

  private buildResult(user: User): AuthResult {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
