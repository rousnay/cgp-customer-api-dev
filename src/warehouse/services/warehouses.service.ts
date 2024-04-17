import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { WarehousesDto } from '../dtos/warehouses.dto';

@Injectable()
export class WarehousesService {
  findWarehousesByCategoryId(categoryId: number) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(): Promise<any> {
    const warehousesQuery = `SELECT * FROM warehouses`;
    const warehousesResults = await this.entityManager.query(warehousesQuery);

    const warehousesWithDetails = [];
    for (const warehouse of warehousesResults) {
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
        brands: brandsResult.map((category: { name: string }) => category.name),
      });
    }

    return {
      data: warehousesWithDetails,
    };
  }

  async findOne(id: number): Promise<any> {
    const warehouseQuery = `
      SELECT w.*
      FROM warehouses w
      WHERE w.id = ?`;

    const warehouseResult = await this.entityManager.query(warehouseQuery, [
      id,
    ]);
    if (!warehouseResult[0]) {
      throw new NotFoundException(`Warehouse with id ${id} not found`);
    }

    const mainBranchQuery = `
      SELECT b.*
      FROM warehouse_branches b
      WHERE b.warehouse_id = ? AND b.branch_type = 'head office'`;

    const mainBranchResult = await this.entityManager.query(mainBranchQuery, [
      id,
    ]);

    const branchesQuery = `SELECT * FROM warehouse_branches WHERE warehouse_id = ?`;
    const branchesResults = await this.entityManager.query(branchesQuery, [id]);

    const categoriesQuery = `
      SELECT c.*
      FROM category_product cp
      INNER JOIN categories c ON cp.category_id = c.id
      WHERE cp.product_id IN (
        SELECT pw.product_id
        FROM product_warehouse_branch pw
        WHERE pw.warehouse_id = ?
      )
      GROUP BY c.id`;

    const categoriesResult = await this.entityManager.query(categoriesQuery, [
      id,
    ]);

    const brandsQuery = `
      SELECT b.*
      FROM products p
      INNER JOIN brands b ON p.brand_id = b.id
      WHERE p.id IN (
        SELECT pw.product_id
        FROM product_warehouse_branch pw
        WHERE pw.warehouse_id = ?
      )
      GROUP BY b.id`;

    const brandsResult = await this.entityManager.query(brandsQuery, [id]);

    return {
      data: {
        ...warehouseResult[0],
        main_branch: mainBranchResult[0],
        branches: branchesResults,
        categories: categoriesResult,
        brands: brandsResult,
      },
    };
  }
}
