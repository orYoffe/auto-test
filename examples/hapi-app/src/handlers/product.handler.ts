import { Request, ResponseToolkit } from '@hapi/hapi';

// Product interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock database
const products: Product[] = [
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

export class ProductHandler {
  // Get all products
  getAllProducts = async (request: Request, h: ResponseToolkit) => {
    try {
      return h.response(products).code(200);
    } catch (error) {
      return h.response({
        message: 'Error retrieving products',
        error: error.message,
      }).code(500);
    }
  };

  // Get product by ID
  getProductById = async (request: Request, h: ResponseToolkit) => {
    try {
      const id = request.params.id;
      const product = products.find((p) => p.id === id);

      if (!product) {
        return h.response({
          message: `Product with ID ${id} not found`,
        }).code(404);
      }

      return h.response(product).code(200);
    } catch (error) {
      return h.response({
        message: 'Error retrieving product',
        error: error.message,
      }).code(500);
    }
  };

  // Create new product
  createProduct = async (request: Request, h: ResponseToolkit) => {
    try {
      const payload = request.payload as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
      
      // Validate payload
      if (!payload.name || !payload.price) {
        return h.response({
          message: 'Name and price are required',
        }).code(400);
      }

      const newProduct: Product = {
        id: (products.length + 1).toString(),
        ...payload,
        inStock: payload.inStock ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      products.push(newProduct);

      return h.response(newProduct).code(201);
    } catch (error) {
      return h.response({
        message: 'Error creating product',
        error: error.message,
      }).code(500);
    }
  };

  // Update product
  updateProduct = async (request: Request, h: ResponseToolkit) => {
    try {
      const id = request.params.id;
      const payload = request.payload as Partial<Product>;
      
      const productIndex = products.findIndex((p) => p.id === id);
      
      if (productIndex === -1) {
        return h.response({
          message: `Product with ID ${id} not found`,
        }).code(404);
      }
      
      const updatedProduct = {
        ...products[productIndex],
        ...payload,
        updatedAt: new Date(),
      };
      
      products[productIndex] = updatedProduct;
      
      return h.response(updatedProduct).code(200);
    } catch (error) {
      return h.response({
        message: 'Error updating product',
        error: error.message,
      }).code(500);
    }
  };

  // Delete product
  deleteProduct = async (request: Request, h: ResponseToolkit) => {
    try {
      const id = request.params.id;
      const productIndex = products.findIndex((p) => p.id === id);
      
      if (productIndex === -1) {
        return h.response({
          message: `Product with ID ${id} not found`,
        }).code(404);
      }
      
      products.splice(productIndex, 1);
      
      return h.response({
        message: `Product with ID ${id} deleted successfully`,
      }).code(200);
    } catch (error) {
      return h.response({
        message: 'Error deleting product',
        error: error.message,
      }).code(500);
    }
  };
}
