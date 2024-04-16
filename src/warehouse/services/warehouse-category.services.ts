import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class WarehouseCategoryService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findWarehousesByCategoryId(categoryId: number): Promise<any> {
    // Query to fetch category object
    const categoryQuery = `
        SELECT c.*
        FROM categories c
        WHERE c.id = ?`;

    const categoryResult = await this.entityManager.query(categoryQuery, [
      categoryId,
    ]);

    const warehousesQuery = `
        SELECT w.*
        FROM warehouses w
        INNER JOIN product_warehouse_branch pw ON w.id = pw.warehouse_id
        INNER JOIN category_product cp ON pw.product_id = cp.product_id
        WHERE cp.category_id = ?`;

    const warehouseResults = await this.entityManager.query(warehousesQuery, [
      categoryId,
    ]);

    const warehousesWithDetails = [];
    for (const warehouse of warehouseResults) {
      const branchesQuery = `SELECT * FROM warehouse_branches WHERE warehouse_id = ?`;
      const branchesResults = await this.entityManager.query(branchesQuery, [
        warehouse.id,
      ]);
      const mainBranch =
        branchesResults.find(
          (branch) => branch.branch_type === 'head office',
        ) || {};

      const categoriesQuery = `
        SELECT c.name
        FROM category_product cp
        INNER JOIN categories c ON cp.category_id = c.id
        WHERE cp.product_id IN (
          SELECT pw.product_id
          FROM product_warehouse_branch pw
          WHERE pw.warehouse_id = ?
        )
        GROUP BY c.name`;
      const categoriesResult = await this.entityManager.query(categoriesQuery, [
        warehouse.id,
      ]);

      const brandsQuery = `
        SELECT b.name
        FROM products p
        INNER JOIN brands b ON p.brand_id = b.id
        WHERE p.id IN (
          SELECT pw.product_id
          FROM product_warehouse_branch pw
          WHERE pw.warehouse_id = ?
        )
        GROUP BY b.name`;
      const brandsResult = await this.entityManager.query(brandsQuery, [
        warehouse.id,
      ]);

      warehousesWithDetails.push({
        ...warehouse,
        main_branch: mainBranch,
        categories: categoriesResult.map(
          (category: { name: string }) => category.name,
        ),
        brands: brandsResult.map((brand: { name: string }) => brand.name),
      });
    }

    return {
      category: categoryResult[0],
      warehouses: warehousesWithDetails,
    };
  }
}
