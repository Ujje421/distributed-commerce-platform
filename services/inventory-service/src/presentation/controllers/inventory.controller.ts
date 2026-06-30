import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from '../../application/services/inventory.service';
import { ReserveStockDto, ReleaseStockDto, UpdateStockDto } from '../dto/inventory.dto';
import { RolesGuard, Roles, Role } from '@ecommerce/common';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':sku')
  async getStock(@Param('sku') sku: string) {
    return this.inventoryService.getStock(sku);
  }

  @Patch(':sku')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateStock(
    @Param('sku') sku: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.inventoryService.updateStock(sku, dto);
  }

  @Post('reserve')
  @UseGuards(RolesGuard)
  // Can be called by internal services (e.g. OrderService via JWT or service token)
  @HttpCode(HttpStatus.OK)
  async reserveStock(@Body() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(dto);
  }

  @Post('release')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async releaseStock(@Body() dto: ReleaseStockDto) {
    await this.inventoryService.releaseStock(dto);
    return { success: true };
  }
}
