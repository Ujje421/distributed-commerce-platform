import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { CartService } from '../../application/services/cart.service';
import { AddCartItemDto, UpdateCartItemDto } from '../dto/cart.dto';
import { v4 as uuidv4 } from 'uuid';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private extractCartId(req: Request): string {
    // Determine cart ID from either authenticated user ID or guest session cookie/header
    const userId = (req as any).user?.userId || req.headers['x-user-id'];
    if (userId) {
      return userId as string;
    }
    
    // For guests, use a custom header or generate one (in reality, handled via cookies)
    const guestId = req.headers['x-guest-cart-id'] as string;
    if (guestId) {
      return guestId;
    }
    
    throw new Error('No user or guest session identified');
  }

  @Get()
  async getCart(@Req() req: Request) {
    try {
      const cartId = this.extractCartId(req);
      return await this.cartService.getCart(cartId);
    } catch {
      return { items: [], totalAmount: 0 };
    }
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  async addItem(@Req() req: Request, @Body() dto: AddCartItemDto) {
    // If no cart ID exists, in a real app we'd generate a session ID and set it via cookie.
    // For this demo, if extractCartId fails, we return a newly generated ID in response for the client to track.
    let cartId: string;
    let isNewGuest = false;
    try {
      cartId = this.extractCartId(req);
    } catch {
      cartId = uuidv4();
      isNewGuest = true;
    }
    
    const cart = await this.cartService.addItem(cartId, dto);
    
    return {
      cart,
      ...(isNewGuest && { newGuestCartId: cartId }),
    };
  }

  @Patch('items/:sku')
  async updateItem(
    @Req() req: Request,
    @Param('sku') sku: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cartId = this.extractCartId(req);
    return this.cartService.updateItem(cartId, sku, dto);
  }

  @Delete('items/:sku')
  async removeItem(@Req() req: Request, @Param('sku') sku: string) {
    const cartId = this.extractCartId(req);
    return this.cartService.removeItem(cartId, sku);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Req() req: Request) {
    const cartId = this.extractCartId(req);
    await this.cartService.clearCart(cartId);
  }

  @Post('merge/:guestCartId')
  @HttpCode(HttpStatus.OK)
  async mergeCarts(
    @Req() req: Request,
    @Param('guestCartId') guestCartId: string,
  ) {
    const userId = (req as any).user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new Error('Must be logged in to merge carts');
    }
    return this.cartService.mergeCarts(guestCartId, userId as string);
  }
}
