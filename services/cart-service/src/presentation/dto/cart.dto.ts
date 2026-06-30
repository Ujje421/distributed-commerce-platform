import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number; // Stored price at the time of adding to cart

  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class AddCartItemDto extends CartItemDto {}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity!: number;
}
