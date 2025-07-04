import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProductsService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Laptop',
      description: 'High-performance laptop for developers',
      price: 1299.99,
      category: 'Electronics',
      inStock: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Smartphone',
      description: 'Latest smartphone with advanced camera',
      price: 899.99,
      category: 'Electronics',
      inStock: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: string): Product {
    const product = this.products.find(product => product.id === id);
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  findByCategory(category: string): Product[] {
    return this.products.filter(product => product.category === category);
  }

  create(createProductDto: CreateProductDto): Product {
    const newProduct: Product = {
      id: (this.products.length + 1).toString(),
      ...createProductDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.products.push(newProduct);
    return newProduct;
  }

  update(id: string, updateProductDto: UpdateProductDto): Product {
    const index = this.products.findIndex(product => product.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    const updatedProduct = {
      ...this.products[index],
      ...updateProductDto,
      updatedAt: new Date(),
    };
    
    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  remove(id: string): void {
    const index = this.products.findIndex(product => product.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    this.products.splice(index, 1);
  }
}
