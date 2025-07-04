import { ServerRoute } from '@hapi/hapi';
import { ProductHandler } from '../handlers/product.handler';

const productHandler = new ProductHandler();

export const productRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/api/products',
    handler: productHandler.getAllProducts,
  },
  {
    method: 'GET',
    path: '/api/products/{id}',
    handler: productHandler.getProductById,
  },
  {
    method: 'POST',
    path: '/api/products',
    handler: productHandler.createProduct,
  },
  {
    method: 'PUT',
    path: '/api/products/{id}',
    handler: productHandler.updateProduct,
  },
  {
    method: 'DELETE',
    path: '/api/products/{id}',
    handler: productHandler.deleteProduct,
  },
];
