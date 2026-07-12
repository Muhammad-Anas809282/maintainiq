import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<UsersService>;
  let mail: jest.Mocked<MailService>;

  const baseUser = {
    id: 'u1',
    email: 'admin@maintainiq.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    passwordHash: '',
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            updatePassword: jest.fn(),
            setResetToken: jest.fn(),
            findByValidResetToken: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: { passwordReset: jest.fn(), send: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed.jwt.token') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(undefined) },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    users = module.get(UsersService);
    mail = module.get(MailService);
  });

  describe('register', () => {
    it('throws ConflictException if the email is already registered', async () => {
      users.findByEmail.mockResolvedValue(baseUser);
      await expect(
        service.register(
          { name: 'X', email: baseUser.email, password: 'secret1' },
          UserRole.TECHNICIAN,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('hashes the password and creates the user with the given role', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue({ ...baseUser, role: UserRole.TECHNICIAN });

      await service.register(
        { name: 'Tech', email: 'tech@x.com', password: 'secret1' },
        UserRole.TECHNICIAN,
      );

      expect(users.create).toHaveBeenCalledTimes(1);
      const created = users.create.mock.calls[0][0];
      expect(created.role).toBe(UserRole.TECHNICIAN);
      expect(created.passwordHash).not.toBe('secret1');
      expect(await bcrypt.compare('secret1', created.passwordHash as string)).toBe(
        true,
      );
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when the user does not exist', async () => {
      users.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@x.com', password: 'whatever' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException on a wrong password', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      users.findByEmail.mockResolvedValue({ ...baseUser, passwordHash: hash });
      await expect(
        service.login({ email: baseUser.email, password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns a signed token and user on valid credentials', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      users.findByEmail.mockResolvedValue({ ...baseUser, passwordHash: hash });

      const result = await service.login({
        email: baseUser.email,
        password: 'correct-password',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).toEqual({
        id: baseUser.id,
        name: baseUser.name,
        email: baseUser.email,
        role: baseUser.role,
      });
    });
  });

  describe('forgotPassword', () => {
    it('resolves ok without sending mail when the email is unknown (no enumeration)', async () => {
      users.findByEmail.mockResolvedValue(null);
      const result = await service.forgotPassword({ email: 'nobody@x.com' });
      expect(result).toEqual({ ok: true });
      expect(mail.passwordReset).not.toHaveBeenCalled();
      expect(users.setResetToken).not.toHaveBeenCalled();
    });

    it('sets a reset token and sends an email for a known user', async () => {
      users.findByEmail.mockResolvedValue(baseUser);
      const result = await service.forgotPassword({ email: baseUser.email });
      expect(result).toEqual({ ok: true });
      expect(users.setResetToken).toHaveBeenCalledTimes(1);
      expect(mail.passwordReset).toHaveBeenCalledTimes(1);
      expect(mail.passwordReset).toHaveBeenCalledWith(
        baseUser.email,
        baseUser.name,
        expect.stringContaining('/reset-password?token='),
      );
    });
  });

  describe('resetPassword', () => {
    it('throws UnauthorizedException for an invalid or expired token', async () => {
      users.findByValidResetToken.mockResolvedValue(null);
      await expect(
        service.resetPassword({ token: 'bad-token', password: 'newpass1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(users.updatePassword).not.toHaveBeenCalled();
    });

    it('updates the password for a valid token', async () => {
      users.findByValidResetToken.mockResolvedValue(baseUser);
      users.updatePassword.mockResolvedValue(baseUser);

      const result = await service.resetPassword({
        token: 'good-token',
        password: 'newpass1',
      });

      expect(result).toEqual({ ok: true });
      expect(users.updatePassword).toHaveBeenCalledWith(
        baseUser.id,
        expect.any(String),
      );
    });
  });

  describe('oauthLogin', () => {
    it('logs in an existing user matched by email without creating a new one', async () => {
      users.findByEmail.mockResolvedValue(baseUser);

      const result = await service.oauthLogin({
        email: baseUser.email,
        name: 'Ignored Name',
      });

      expect(users.create).not.toHaveBeenCalled();
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe(baseUser.email);
    });

    it('creates a new TECHNICIAN user on first Google sign-in', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue({
        ...baseUser,
        id: 'new-1',
        email: 'newperson@gmail.com',
        name: 'New Person',
        role: UserRole.TECHNICIAN,
      });

      const result = await service.oauthLogin({
        email: 'newperson@gmail.com',
        name: 'New Person',
      });

      expect(users.create).toHaveBeenCalledTimes(1);
      const created = users.create.mock.calls[0][0];
      expect(created.role).toBe(UserRole.TECHNICIAN);
      expect(created.email).toBe('newperson@gmail.com');
      expect(result.user.role).toBe(UserRole.TECHNICIAN);
    });
  });
});
