import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  quantity!: number;
}

export class ReserveStockDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class ReleaseStockDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;
}
