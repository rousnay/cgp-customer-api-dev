import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ProductsDto } from '../dtos/products.dto';

@Injectable()
export class ProductWarehouseBranchService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findProductsByBranchId(branchId: number): Promise<ProductsDto[]> {
    const query = `
      SELECT p.*
      FROM products p
      INNER JOIN product_warehouse_branch pw ON p.id = pw.product_id
      WHERE pw.warehouse_branch_id = ?`;

    const products = await this.entityManager.query(query, [branchId]);
    return products;
  }
}
