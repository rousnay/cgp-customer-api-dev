import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ProductsDto } from '../dtos/products.dto';

@Injectable()
export class ProductWarehouseService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findProductsByWarehouseId(warehouseId: number): Promise<any> {
    // Fetch warehouse data
    const warehouseQuery = `
            SELECT
                *
            FROM
                warehouses
            WHERE
                id = ?`;
    const warehouseResult = await this.entityManager.query(warehouseQuery, [
      warehouseId,
    ]);
    const warehouseData = warehouseResult[0]; // Assuming there's only one warehouse with the given id

    const branchesQuery = `SELECT * FROM warehouse_branches WHERE warehouse_id = ?`;
    const branchesResults = await this.entityManager.query(branchesQuery, [
      warehouseData.id,
    ]);
    const mainBranch =
      branchesResults.find((branch) => branch.branch_type === 'head office') ||
      {};

    const productsQuery = `
      SELECT p.*
      FROM products p
      INNER JOIN product_warehouse_branch pw ON p.id = pw.product_id
      WHERE pw.warehouse_id = ?`;

    const productResults = await this.entityManager.query(productsQuery, [
      warehouseId,
    ]);

    const productsWithBrandData = [];
    for (const product of productResults) {
      const { brand_id, ...productData } = product; // Destructure the brand_id property
      const brandQuery = `
            SELECT
                *
            FROM
                brands
            WHERE
                id = ?`;
      const brandResult = await this.entityManager.query(brandQuery, [
        brand_id,
      ]);
      const brandData = brandResult[0]; // Assuming there's only one brand with the given id
      productsWithBrandData.push({
        ...productData, // Include all other properties from the product
        brand_name: brandData.name, // Add the brand data as a separate object
      });
    }

    return {
      warehouse: { warehouseData, main_branch: mainBranch },
      products: productsWithBrandData,
    };
  }
}
