import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProductPrismaService } from '../../infrastructure/persistence/database.module';
import { SearchService } from '../../infrastructure/search/search.service';
import { OutboxService } from '@ecommerce/kafka';
import { EventType } from '@ecommerce/common';
import { CreateProductDto, UpdateProductDto } from '../../presentation/dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: ProductPrismaService,
    private readonly searchService: SearchService,
    private readonly outboxService: OutboxService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });

    if (existing) {
      throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category ${dto.categoryId} not found`);
    }

    // Use Prisma transaction to ensure outbox consistency
    const product = await this.prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,
          brand: dto.brand,
          sku: dto.sku,
          categoryId: dto.categoryId,
        },
        include: { category: true },
      });

      // Write to outbox
      const message = this.outboxService.createMessage(
        EventType.PRODUCT_CREATED,
        newProduct,
        { key: newProduct.id, source: 'product-catalog-service' }
      );
      await tx.outbox.create(message as any); // Cast as any if Prisma type differs slightly

      return newProduct;
    });

    // Sync to OpenSearch
    await this.searchService.indexProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      brand: product.brand,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      status: product.status,
    });

    return product;
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { order: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: dto,
        include: { category: true },
      });

      const message = this.outboxService.createMessage(
        EventType.PRODUCT_UPDATED,
        updatedProduct,
        { key: updatedProduct.id, source: 'product-catalog-service' }
      );
      await tx.outbox.create(message as any);

      return updatedProduct;
    });

    await this.searchService.indexProduct({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      price: updated.price,
      brand: updated.brand,
      categoryId: updated.categoryId,
      categoryName: updated.category.name,
      status: updated.status,
    });

    return updated;
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.product.delete({ where: { id } });

      const message = this.outboxService.createMessage(
        EventType.PRODUCT_DELETED,
        { id },
        { key: id, source: 'product-catalog-service' }
      );
      await tx.outbox.create(message as any);
    });

    await this.searchService.removeProduct(id);
  }
}
