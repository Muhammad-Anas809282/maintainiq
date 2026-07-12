import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, VerifyCallback, Profile } from 'passport-google-oauth20';

export interface GoogleProfile {
  email: string;
  name: string;
}

// Config-tolerant: if GOOGLE_CLIENT_ID/SECRET are unset, the strategy still
// constructs (so the app boots fine) but the OAuth routes will simply fail
// with a clear error if actually hit, matching the AI/Mail/Cloudinary pattern.
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID') || 'not-configured';
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET') || 'not-configured';
    const apiUrl = config.get<string>('API_URL') ?? 'http://localhost:4000/api';
    const options: StrategyOptions = {
      clientID,
      clientSecret,
      callbackURL: `${apiUrl.replace(/\/$/, '')}/auth/google/callback`,
      scope: ['email', 'profile'],
    };
    super(options);
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || email || 'Google User';
    if (!email) {
      done(new Error('Google account has no email'), undefined);
      return;
    }
    const user: GoogleProfile = { email, name };
    done(null, user);
  }
}
