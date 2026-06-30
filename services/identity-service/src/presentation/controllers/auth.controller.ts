import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  Res,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { RegisterCommand } from '../../application/commands/register.command';
import { RegisterDto } from '../dto/register.dto';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { LocalAuthGuard } from '../../infrastructure/auth/guards/local-auth.guard';
import { GoogleAuthGuard } from '../../infrastructure/auth/guards/google-auth.guard';
import { GithubAuthGuard } from '../../infrastructure/auth/guards/github-auth.guard';
import { ServiceJwtAuthGuard } from '../../infrastructure/auth/guards/service-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.commandBus.execute(
      new RegisterCommand(dto.email, dto.password, dto.firstName, dto.lastName),
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || 'unknown';
    return this.authService.login(req.user, userAgent, ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') token: string, @Req() req: Request) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || 'unknown';
    return this.authService.refresh(token, userAgent, ip);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body('refreshToken') token: string) {
    await this.authService.logout(token);
  }

  // --- Google OAuth ---

  @Get('oauth/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Redirects to Google
  }

  @Get('oauth/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || 'unknown';
    const tokens = await this.authService.processOAuthLogin(
      req.user as any,
      userAgent,
      ip,
    );

    // If client redirect URL is configured, redirect there, otherwise return JSON
    const redirectUrl = process.env.OAUTH_REDIRECT_URL;
    if (redirectUrl) {
      return res.redirect(
        `${redirectUrl}?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
      );
    }

    return res.status(HttpStatus.OK).json(tokens);
  }

  // --- GitHub OAuth ---

  @Get('oauth/github')
  @UseGuards(GithubAuthGuard)
  async githubAuth() {
    // Redirects to GitHub
  }

  @Get('oauth/github/callback')
  @UseGuards(GithubAuthGuard)
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || 'unknown';
    const tokens = await this.authService.processOAuthLogin(
      req.user as any,
      userAgent,
      ip,
    );

    const redirectUrl = process.env.OAUTH_REDIRECT_URL;
    if (redirectUrl) {
      return res.redirect(
        `${redirectUrl}?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
      );
    }

    return res.status(HttpStatus.OK).json(tokens);
  }

  // --- API Key Management ---

  @UseGuards(ServiceJwtAuthGuard)
  @Post('api-keys')
  @HttpCode(HttpStatus.CREATED)
  async createApiKey(@Req() req: Request, @Body() dto: CreateApiKeyDto) {
    const userId = (req.user as any).id;
    return this.authService.createApiKey(userId, dto.name, dto.roles, dto.expiresDays);
  }

  @UseGuards(ServiceJwtAuthGuard)
  @Get('api-keys')
  async listApiKeys(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.authService.listApiKeys(userId);
  }

  @UseGuards(ServiceJwtAuthGuard)
  @Delete('api-keys/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeApiKey(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any).id;
    await this.authService.revokeApiKey(userId, id);
  }
}
