import { IsString, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Smartphone' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product description', example: 'High-end smartphone with great camera' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product price', example: 999.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Product category', example: 'Electronics' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Whether the product is in stock', example: true })
  @IsBoolean()
  @IsOptional()
  inStock: boolean = true;
}

export class UpdateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Smartphone', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Product description', example: 'High-end smartphone with great camera', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Product price', example: 999.99, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Product category', example: 'Electronics', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Whether the product is in stock', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;
}
