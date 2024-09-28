import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class WarehouseCategoryService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  // async findWarehousesByCategoryId(categoryId: number): Promise<any> {
  //   // Query to fetch category object
  //   const categoryQuery = `
  //       SELECT c.*
  //       FROM categories c
  //       WHERE c.id = ?`;

  //   const categoryResult = await this.entityManager.query(categoryQuery, [
  //     categoryId,
  //   ]);

  //   const warehousesQuery = `
  //       SELECT w.*
  //       FROM warehouses w
  //       INNER JOIN product_warehouse_branch pw ON w.id = pw.warehouse_id
  //       INNER JOIN category_product cp ON pw.product_id = cp.product_id
  //       WHERE cp.category_id = ?`;

  //   const warehouseResults = await this.entityManager.query(warehousesQuery, [
  //     categoryId,
  //   ]);

  //   const warehousesWithDetails = [];
  //   for (const warehouse of warehouseResults) {
  //     const branchesQuery = `SELECT * FROM warehouse_branches WHERE warehouse_id = ?`;
  //     const branchesResults = await this.entityManager.query(branchesQuery, [
  //       warehouse.id,
  //     ]);
  //     const mainBranch =
  //       branchesResults.find(
  //         (branch) => branch.branch_type === 'head office',
  //       ) || {};

  //     const categoriesQuery = `
  //       SELECT c.name
  //       FROM category_product cp
  //       INNER JOIN categories c ON cp.category_id = c.id
  //       WHERE cp.product_id IN (
  //         SELECT pw.product_id
  //         FROM product_warehouse_branch pw
  //         WHERE pw.warehouse_id = ?
  //       )
  //       GROUP BY c.name`;
  //     const categoriesResult = await this.entityManager.query(categoriesQuery, [
  //       warehouse.id,
  //     ]);

  //     const brandsQuery = `
  //       SELECT b.name
  //       FROM products p
  //       INNER JOIN brands b ON p.brand_id = b.id
  //       WHERE p.id IN (
  //         SELECT pw.product_id
  //         FROM product_warehouse_branch pw
  //         WHERE pw.warehouse_id = ?
  //       )
  //       GROUP BY b.name`;
  //     const brandsResult = await this.entityManager.query(brandsQuery, [
  //       warehouse.id,
  //     ]);

  //     warehousesWithDetails.push({
  //       ...warehouse,
  //       main_branch: mainBranch,
  //       categories: categoriesResult.map(
  //         (category: { name: string }) => category.name,
  //       ),
  //       brands: brandsResult.map((brand: { name: string }) => brand.name),
  //     });
  //   }

  //   return {
  //     category: categoryResult[0],
  //     warehouses: warehousesWithDetails,
  //   };
  // }

  async findWarehousesByCategoryId(
    categoryId: number,
    paginationQuery?: any,
  ): Promise<any> {
    const page = paginationQuery?.page || 1;
    const perPage = paginationQuery?.perPage || 20;
    // Query to fetch category object
    const categoryQuery = `
        SELECT c.*
        FROM categories c
        WHERE c.id = ?`;

    const categoryResult = await this.entityManager.query(categoryQuery, [
      categoryId,
    ]);

    const warehousesQuery = `
        SELECT w.id, w.name, COUNT(DISTINCT pw.product_id) as product_counts
        FROM warehouses w
        INNER JOIN product_warehouse_branch pw ON w.id = pw.warehouse_id
        INNER JOIN category_product cp ON pw.product_id = cp.product_id
        WHERE cp.category_id = ?
        GROUP BY w.id, w.name LIMIT ? OFFSET ?`;

    const warehouseResults = await this.entityManager.query(warehousesQuery, [
      categoryId,
      perPage,
      (page - 1) * perPage,
    ]);

    const total = await this.entityManager.query(
      ` SELECT COUNT(DISTINCT pw.product_id) as count
        FROM warehouses w
        INNER JOIN product_warehouse_branch pw ON w.id = pw.warehouse_id
        INNER JOIN category_product cp ON pw.product_id = cp.product_id
        WHERE cp.category_id = ?
        GROUP BY w.id, w.name `,
      [categoryId],
    );

    const per_page = Number(perPage);
    const current_page = Number(page);
    const last_page = Number(Math.ceil(total[0].count / per_page));
    const first_page_url = '';
    const last_page_url = '';
    const next_page_url = '';
    const prev_page_url = '';
    const path = '';
    const from = Number((page - 1) * perPage + 1);
    const to = Number(page * perPage);

    return {
      data: {
        category: categoryResult[0],
        warehouses: warehouseResults,
      },
      total: Number(total[0].count),
      per_page,
      current_page,
      last_page,
      first_page_url,
      last_page_url,
      next_page_url,
      prev_page_url,
      path,
      from,
      to,
    };
  }
}
