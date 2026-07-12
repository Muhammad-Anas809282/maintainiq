import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Config-tolerant email service. If SMTP env vars are not set, it logs and
 * no-ops so the app runs fine without email configured.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from = 'MaintainIQ <no-reply@maintainiq.app>';

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const from = this.config.get<string>('SMTP_FROM');
    if (from) this.from = from;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  /** Fire-and-forget send; never throws to the caller. */
  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter || !to) {
      this.logger.debug(`Email skipped (not configured): "${subject}" -> ${to}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent: "${subject}" -> ${to}`);
    } catch (err) {
      this.logger.warn(`Email failed: ${(err as Error).message}`);
    }
  }

  issueAssigned(to: string, techName: string, issueNumber: string, title: string) {
    return this.send(
      to,
      `You've been assigned issue ${issueNumber}`,
      `<p>Hi ${techName},</p><p>You have been assigned issue <b>${issueNumber}</b>: ${title}.</p><p>— MaintainIQ</p>`,
    );
  }

  issueResolved(to: string, issueNumber: string, title: string) {
    return this.send(
      to,
      `Issue ${issueNumber} resolved`,
      `<p>Issue <b>${issueNumber}</b> (${title}) has been resolved.</p><p>— MaintainIQ</p>`,
    );
  }

  passwordReset(to: string, name: string, resetUrl: string) {
    return this.send(
      to,
      'Reset your MaintainIQ password',
      `<p>Hi ${name},</p><p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p><p>— MaintainIQ</p>`,
    );
  }
}
