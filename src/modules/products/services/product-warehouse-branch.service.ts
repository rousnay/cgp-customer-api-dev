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

  async findProductsByBranchId(branchId: number): Promise<any> {
    // Fetch branch data
    const branchQuery = `
            SELECT
                *
            FROM
                warehouse_branches
            WHERE
                id = ?`;
    const branchResult = await this.entityManager.query(branchQuery, [
      branchId,
    ]);
    const branchData = branchResult[0]; // Assuming there's only one branch with the given id

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
        products p
      LEFT JOIN
        brands b ON p.brand_id = b.id
      LEFT JOIN
        categories c ON p.category_id = c.id
      LEFT JOIN
        product_warehouse_branch pw ON p.id = pw.product_id
      LEFT JOIN
        warehouses w ON pw.warehouse_id = w.id
      WHERE pw.warehouse_branch_id = ?`;

    const productResults = await this.entityManager.query(productsQuery, [
      branchId,
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

      const brandData = brandResult[0]; // Assuming there's only one brand with the given id
      productsWithBrandData.push({
        ...productData, // Include all other properties from the product
        brand_name: brandData.name, // Add the brand data as a separate object
        warehouses: warehouseResults,
      });
    }

    return {
      data: {
        branch: branchData,
        products: productsWithBrandData,
      },
    };
  }
}
