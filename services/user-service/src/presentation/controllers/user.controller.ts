import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserPrismaService } from '../../infrastructure/persistence/database.module';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { CreateAddressDto } from '../dto/create-address.dto';

@Controller('users')
export class UserController {
  constructor(private readonly prisma: UserPrismaService) {}

  /**
   * GET /users/me — Get current user's profile
   */
  @Get('me')
  async getProfile(@Req() req: Request) {
    const userId = (req as any).user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.prisma.userProfile.findUnique({
      where: { id: userId as string },
      include: { addresses: true },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }

  /**
   * PATCH /users/me — Update current user's profile
   */
  @Patch('me')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const userId = (req as any).user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.userProfile.update({
      where: { id: userId as string },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.preferences !== undefined && { preferences: dto.preferences }),
      },
      include: { addresses: true },
    });
  }

  /**
   * GET /users/me/addresses — List user's addresses
   */
  @Get('me/addresses')
  async listAddresses(@Req() req: Request) {
    const userId = (req as any).user?.userId || req.headers['x-user-id'];

    return this.prisma.address.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * POST /users/me/addresses — Create a new address
   */
  @Post('me/addresses')
  @HttpCode(HttpStatus.CREATED)
  async createAddress(@Req() req: Request, @Body() dto: CreateAddressDto) {
    const userId = (req as any).user?.userId || req.headers['x-user-id'];

    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId: userId as string, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId: userId as string,
        street: dto.street,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        zipCode: dto.zipCode,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  /**
   * DELETE /users/me/addresses/:id — Delete an address
   */
  @Delete('me/addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user?.userId || req.headers['x-user-id'];

    await this.prisma.address.deleteMany({
      where: { id, userId: userId as string },
    });
  }
}
