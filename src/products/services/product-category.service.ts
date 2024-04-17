import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findProductsByCategoryId(categoryId: number): Promise<any> {
    // Query to fetch category object
    const categoryQuery = `
        SELECT c.*
        FROM categories c
        WHERE c.id = ?`;

    const categoryResult = await this.entityManager.query(categoryQuery, [
      categoryId,
    ]);

    // Query to fetch products
    const productsQuery = `
      SELECT p.*
      FROM products p
      INNER JOIN category_product cp ON p.id = cp.product_id
      WHERE cp.category_id = ?`;

    const productResults = await this.entityManager.query(productsQuery, [
      categoryId,
    ]);

    const productsWithCategoryAndWarehouses = [];
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

      productsWithCategoryAndWarehouses.push({
        ...productData, // Entire product object
        brand_name: brandData.name, // Add the brand data as a separate object
        warehouses: warehouseResults,
      });
    }

    return {
      category: categoryResult[0],
      products: productsWithCategoryAndWarehouses,
    };
  }
}
