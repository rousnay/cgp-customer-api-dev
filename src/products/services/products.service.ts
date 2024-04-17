// product.service.ts
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ProductsDto } from '../dtos/products.dto';

@Injectable()
export class ProductsService {
  findProductsByCategoryId(categoryId: number) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(): Promise<any[]> {
    const productsQuery = `
      SELECT
        *
      FROM
        products`;

    const productResults = await this.entityManager.query(productsQuery);

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

      // Fetching warehouse data
      const warehousesQuery = `
            SELECT
                pw.warehouse_id,
                w.name AS warehouse_name
            FROM
                product_warehouse_branch pw
            INNER JOIN
                warehouses w ON pw.warehouse_id = w.id
            WHERE
                pw.product_id = ?`;

      const warehouseResults = await this.entityManager.query(warehousesQuery, [
        product.id,
      ]);
      productsWithBrandData.push({
        ...productData, // Include all other properties from the product
        brand_name: brandData.name, // Add the brand data as a separate object
        warehouses: warehouseResults,
      });
    }
    return productsWithBrandData;
  }

  async findOne(id: number): Promise<any | undefined> {
    const productQuery = `
      SELECT
        *
      FROM
        products
      WHERE
        id = ?`;

    const productResult = await this.entityManager.query(productQuery, [id]);
    if (productResult.length === 0) {
      return undefined; // Return undefined if no product is found
    }

    const productData = productResult[0];
    const brandId = productData.brand_id;

    // Fetch brand data based on brandId
    const brandQuery = `
      SELECT
        *
      FROM
        brands
      WHERE
        id = ?`;

    const brandResult = await this.entityManager.query(brandQuery, [brandId]);
    const brandData = brandResult.length > 0 ? brandResult[0] : {};

    // Fetching warehouse data
    const warehousesQuery = `
            SELECT
                *
            FROM
                product_warehouse_branch pw
            INNER JOIN
                warehouses w ON pw.warehouse_id = w.id
            WHERE
                pw.product_id = ?`;

    const warehousesResults = await this.entityManager.query(warehousesQuery, [
      id,
    ]);

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

      warehousesWithDetails.push({
        ...warehouse,
        main_branch: mainBranch,
      });
    }

    // Return product data with brand data as a separate object
    return {
      data: {
        ...productData,
        brand: brandData,
        warehouses: warehousesWithDetails,
      },
    };
  }
}
