import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { IdentityPrismaService } from '../persistence/database.module';
import { OutboxService } from '@ecommerce/kafka';
import { EventType, Role, UserRegisteredData } from '@ecommerce/common';

@Injectable()
export class AuthService {
  constructor(
    @Inject('PrismaService') private readonly prisma: IdentityPrismaService,
    private readonly jwtService: JwtService,
    private readonly outboxService: OutboxService,
  ) {}

  /**
   * Validates user credentials.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return null;
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (isMatch) {
      const { passwordHash, mfaSecret, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Generates a pair of JWT access and refresh tokens.
   */
  async login(user: any, device?: string, ipAddress?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const rawRefreshToken = uuidv4();
    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // 7 days

    // Save refresh token to DB
    await this.prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        device,
        ipAddress,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Create session audit
    await this.prisma.session.create({
      data: {
        userId: user.id,
        device,
        ipAddress,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  /**
   * Verifies and rotates a refresh token.
   */
  async refresh(token: string, device?: string, ipAddress?: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const savedToken = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!savedToken || savedToken.isRevoked || new Date() > savedToken.expiresAt) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { isRevoked: true },
    });

    // Generate new pair
    return this.login(savedToken.user, device, ipAddress);
  }

  /**
   * Revokes a refresh token (logout).
   */
  async logout(token: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    try {
      await this.prisma.refreshToken.update({
        where: { token: hashedToken },
        data: { isRevoked: true },
      });
    } catch (e) {
      // Token might not exist or already be deleted, ignore for logout
    }
  }

  /**
   * Processes OAuth callback payload.
   */
  async processOAuthLogin(
    profile: { email: string; firstName: string; lastName: string; provider: 'GOOGLE' | 'GITHUB' },
    device?: string,
    ipAddress?: string,
  ) {
    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });

    if (user) {
      // User exists, add login method if not already present
      if (!user.loginMethods.includes(profile.provider)) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            loginMethods: {
              set: [...user.loginMethods, profile.provider],
            },
          },
        });
      }
    } else {
      // Create OAuth User
      const userId = uuidv4();
      const eventData: UserRegisteredData = {
        userId,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        roles: [Role.CUSTOMER],
      };

      await this.prisma.$transaction(async (tx) => {
        user = await tx.user.create({
          data: {
            id: userId,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            roles: [Role.CUSTOMER],
            loginMethods: [profile.provider],
          },
        });

        await tx.outbox.create(
          this.outboxService.createMessage(EventType.USER_REGISTERED, eventData, {
            key: userId,
          })
        );
      });
    }

    return this.login(user, device, ipAddress);
  }

  /**
   * Generates a new API Key for a user.
   */
  async createApiKey(userId: string, name: string, roles: string[], expiresDays?: number) {
    const rawKey = `ec_${crypto.randomBytes(24).toString('hex')}`;
    const prefix = rawKey.substring(0, 7);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    let expiresAt: Date | null = null;
    if (expiresDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresDays);
    }

    await this.prisma.apiKey.create({
      data: {
        name,
        keyHash,
        prefix,
        userId,
        roles,
        expiresAt,
      },
    });

    return {
      name,
      apiKey: rawKey,
      expiresAt,
    };
  }

  /**
   * Lists active API Keys for a user.
   */
  async listApiKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId, isRevoked: false },
      select: {
        id: true,
        name: true,
        prefix: true,
        roles: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Revokes an API Key.
   */
  async revokeApiKey(userId: string, id: string) {
    await this.prisma.apiKey.updateMany({
      where: { id, userId },
      data: { isRevoked: true },
    });
  }
}
