import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { AddCartItemDto, UpdateCartItemDto } from '../../presentation/dto/cart.dto';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export interface Cart {
  items: CartItem[];
  totalAmount: number;
}

export interface CartItem {
  productId: string;
  sku: string;
  quantity: number;
  price: number;
  name: string;
}

@Injectable()
export class CartService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private getCartKey(cartId: string): string {
    return `cart:${cartId}`;
  }

  async getCart(cartId: string): Promise<Cart> {
    const data = await this.redis.get(this.getCartKey(cartId));
    if (!data) {
      return { items: [], totalAmount: 0 };
    }
    return JSON.parse(data);
  }

  async addItem(cartId: string, item: AddCartItemDto): Promise<Cart> {
    const cart = await this.getCart(cartId);
    
    const existingItemIndex = cart.items.findIndex(i => i.sku === item.sku);
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += item.quantity;
      // Optionally update price to latest
      cart.items[existingItemIndex].price = item.price;
    } else {
      cart.items.push(item);
    }

    return this.saveCart(cartId, cart);
  }

  async updateItem(cartId: string, sku: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getCart(cartId);
    
    const existingItemIndex = cart.items.findIndex(i => i.sku === sku);
    if (existingItemIndex === -1) {
      throw new NotFoundException(`Item with SKU ${sku} not found in cart`);
    }

    cart.items[existingItemIndex].quantity = dto.quantity;
    return this.saveCart(cartId, cart);
  }

  async removeItem(cartId: string, sku: string): Promise<Cart> {
    const cart = await this.getCart(cartId);
    cart.items = cart.items.filter(i => i.sku !== sku);
    return this.saveCart(cartId, cart);
  }

  async clearCart(cartId: string): Promise<void> {
    await this.redis.del(this.getCartKey(cartId));
  }

  async mergeCarts(guestCartId: string, userCartId: string): Promise<Cart> {
    const guestCart = await this.getCart(guestCartId);
    if (guestCart.items.length === 0) {
      return this.getCart(userCartId);
    }

    const userCart = await this.getCart(userCartId);
    
    // Merge logic: guest items take precedence or add quantities
    for (const item of guestCart.items) {
      const existingItemIndex = userCart.items.findIndex(i => i.sku === item.sku);
      if (existingItemIndex > -1) {
        userCart.items[existingItemIndex].quantity += item.quantity;
      } else {
        userCart.items.push(item);
      }
    }

    await this.saveCart(userCartId, userCart);
    await this.clearCart(guestCartId); // Clear guest cart after merge
    return userCart;
  }

  private async saveCart(cartId: string, cart: Cart): Promise<Cart> {
    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // TTL: 30 days for cart
    await this.redis.setex(this.getCartKey(cartId), 30 * 24 * 60 * 60, JSON.stringify(cart));
    return cart;
  }
}
