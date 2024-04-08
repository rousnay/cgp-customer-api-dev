import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ProductsDto } from '../dtos/products.dto';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findProductsByCategoryId(categoryId: number): Promise<ProductsDto[]> {
    const query = `
      SELECT p.*
      FROM products p
      INNER JOIN category_product cp ON p.id = cp.product_id
      WHERE cp.category_id = ?`;

    const products = await this.entityManager.query(query, [categoryId]);
    return products;
  }
}
