import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GITHUB_CLIENT_ID') || 'placeholder-id';
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET') || 'placeholder-secret';
    const callbackURL = configService.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:3000/api/v1/auth/oauth/github/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const email = profile.emails?.[0]?.value || '';
    const displayName = profile.displayName || profile.username || '';
    const [firstName, ...rest] = displayName.split(' ');
    const lastName = rest.join(' ') || '';

    const user = {
      email,
      firstName,
      lastName,
      provider: 'GITHUB' as const,
    };
    done(null, user);
  }
}
