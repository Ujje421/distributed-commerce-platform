import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from '../../application/services/product.service';
import { SearchService } from '../../infrastructure/search/search.service';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { RolesGuard, Roles, Role } from '@ecommerce/common';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly searchService: SearchService,
  ) {}

  @Get('search')
  async searchProducts(
    @Query('q') query: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.searchService.search(
      query,
      categoryId,
      minPrice ? Number(minPrice) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
    );
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') query: string) {
    return this.searchService.autocomplete(query);
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productService.getProduct(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string) {
    await this.productService.deleteProduct(id);
  }
}
