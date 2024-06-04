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
SELECT
        pw.id,
        pw.product_name,
        pw.regular_price,
        pw.sales_price,
        pw.quantity,
        pw.active,
        pw.has_own_product_img,
        p.barcode,
        p.category_id,
        p.primary_category_id,
        p.brand_id,
        p.unit,
        p.size_id,
        p.size_height,
        p.size_width,
        p.size_length,
        p.colour_id,
        p.group_id,
        p.weight,
        p.weight_unit_id,
        p.materials,
        p.short_desc,
        p.long_desc,
        p.details_overview,
        p.details_specifications,
        p.details_size_and_materials,
        p.details_size_and_materials,
        p.created_at,
        p.updated_at,
        w.name AS warehouse_name,
        c.name AS category_name,
        b.name AS brand_name
      FROM
        product_warehouse_branch pw
      LEFT JOIN
        products p ON pw.product_id = p.id
      LEFT JOIN
        brands b ON p.brand_id = b.id
      LEFT JOIN
        categories c ON p.category_id = c.id
      LEFT JOIN
        warehouses w ON pw.warehouse_id = w.id
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
                pw.id = ?`;

      const warehouseResults = await this.entityManager.query(warehousesQuery, [
        product.id,
      ]);

      productsWithBrandData.push({
        ...productData, // Include all other properties from the product
        brand_name: brandData.name, // Add the brand data as a separate object
        warehouses: warehouseResults,
      });
    }

    return {
      data: {
        warehouse: { ...warehouseData, main_branch: mainBranch },
        products: productsWithBrandData,
      },
    };
  }

  async findProductsByWarehouseAndCategory(
    warehouseId: number,
    categoryId: number,
  ): Promise<any> {
    const warehousesQuery = `
      SELECT
        w.id as warehouse_id,
        w.name as warehouse_name,
        c.id as category_id,
        c.name as category_name,
        COUNT(DISTINCT pw.id) as product_counts
      FROM
        warehouses w
      INNER JOIN
        product_warehouse_branch pw ON w.id = pw.warehouse_id
      INNER JOIN
        products p ON pw.product_id = p.id
      INNER JOIN
        categories c ON p.category_id = c.id
      WHERE
        p.category_id = ? AND w.id = ?
      GROUP BY
        w.id, w.name, c.id, c.name`;

    const warehouseResults = await this.entityManager.query(warehousesQuery, [
      categoryId,
      warehouseId,
    ]);

    const productQuery = `
      SELECT
        pw.id,
        pw.product_name,
        pw.regular_price,
        pw.sales_price,
        pw.quantity,
        pw.active,
        pw.has_own_product_img,
        p.barcode,
        p.category_id,
        p.primary_category_id,
        p.brand_id,
        p.unit,
        p.size_id,
        p.size_height,
        p.size_width,
        p.size_length,
        p.colour_id,
        p.group_id,
        p.weight,
        p.weight_unit_id,
        p.materials,
        p.short_desc,
        p.long_desc,
        p.details_overview,
        p.details_specifications,
        p.details_size_and_materials,
        p.details_size_and_materials,
        p.created_at,
        p.updated_at,
        w.name AS warehouse_name,
        c.name AS category_name,
        b.name AS brand_name
      FROM
        products p
      LEFT JOIN
        brands b ON p.brand_id = b.id
      LEFT JOIN
        categories c ON p.category_id = c.id
      LEFT JOIN
        product_warehouse_branch pw ON p.id = pw.product_id
      LEFT JOIN
        warehouses w ON pw.warehouse_id = w.id
      WHERE
        pw.warehouse_id = ? AND p.category_id = ?`;

    const productResults = await this.entityManager.query(productQuery, [
      warehouseId,
      categoryId,
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
                pw.id = ?`;

      const warehouseResults = await this.entityManager.query(warehousesQuery, [
        product.id,
      ]);

      productsWithBrandData.push({
        ...productData, // Include all other properties from the product
        brand_name: brandData.name, // Add the brand data as a separate object
        warehouses: warehouseResults,
      });
    }

    return {
      data: {
        ...warehouseResults[0],
        products: productsWithBrandData,
      },
    };
  }
}
