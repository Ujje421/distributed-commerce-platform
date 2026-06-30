import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OrderService } from '../../application/services/order.service';
import { PlaceOrderDto } from '../dto/order.dto';
import { RolesGuard } from '@ecommerce/common';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(RolesGuard) // Assuming the user must be authenticated. JWT validation happens in gateway.
  @HttpCode(HttpStatus.CREATED)
  async placeOrder(@Req() req: Request, @Body() dto: PlaceOrderDto) {
    const userId = (req as any).user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.orderService.placeOrder(userId as string, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  async getUserOrders(@Req() req: Request) {
    const userId = (req as any).user?.userId || req.headers['x-user-id'];
    return this.orderService.getUserOrders(userId as string);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  async getOrder(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user?.userId || req.headers['x-user-id'];
    return this.orderService.getOrder(id, userId as string);
  }
}
