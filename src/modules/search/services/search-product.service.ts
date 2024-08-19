import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class SearchProductService {
  constructor(private readonly entityManager: EntityManager) {}

  async searchProducts(
    query: string,
    brand: string,
    category: string,
    warehouse: string,
    brandId: number,
    categoryId: number,
    warehouseId: number,
    sort: string,
    priceMin: number,
    priceMax: number,
    // currentPage: number,
    // limit: number,
  ): Promise<any> {
    let sqlQuery = `
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
    `;

    // const parameters: any[] = [`%${query}%`];

    const parameters: any[] = [];

    // Check if query is provided
    if (query) {
      sqlQuery += ' WHERE p.name LIKE ?';
      parameters.push(`%${query}%`);
    } else {
      sqlQuery += ' WHERE p.name LIKE ?';
      parameters.push(`%%`);
    }

    // Apply optional filters
    if (brandId) {
      sqlQuery += ' AND p.brand_id = ?';
      parameters.push(brandId);
    } else if (brand) {
      sqlQuery += ' AND UPPER(b.name) = ?';
      parameters.push(brand.toUpperCase());
    }

    if (categoryId) {
      sqlQuery += ' AND p.category_id = ?';
      parameters.push(categoryId);
    } else if (category) {
      sqlQuery += ' AND UPPER(c.name) = ?';
      parameters.push(category.toUpperCase());
    }

    if (warehouseId) {
      sqlQuery += ' AND w.id = ?';
      parameters.push(warehouseId);
    } else if (warehouse) {
      sqlQuery += ' AND UPPER(w.name) LIKE ?';
      parameters.push(`%${warehouse.toUpperCase()}%`);
    }

    if (priceMin) {
      sqlQuery += ` AND pw.price >= ?`;
      parameters.push(priceMin);
    }

    if (priceMax) {
      sqlQuery += ` AND pw.price <= ?`;
      parameters.push(priceMax);
    }

    // Apply sorting
    if (sort) {
      if (sort === 'recent') {
        sqlQuery += ' ORDER BY pw.created_at DESC';
      } else if (sort === 'older') {
        sqlQuery += ' ORDER BY pw.created_at ASC';
      } else if (sort === 'name') {
        sqlQuery += ' ORDER BY pw.name ASC';
      } else if (sort === 'price_high') {
        sqlQuery += ' ORDER BY pw.price DESC';
      } else if (sort === 'price_low') {
        sqlQuery += ' ORDER BY pw.price ASC';
      }
    }
    // Execute the query
    const productResults = await this.entityManager.query(sqlQuery, parameters);

    const productsWithBrandAndWarehouses = [];
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

      productsWithBrandAndWarehouses.push({
        ...productData, // Entire product object
        brand_name: brandData.name, // Add the brand data as a separate object
        warehouses: warehouseResults,
      });
    }

    console.log('products found', productResults.length);

    // Apply pagination
    // currentPage = currentPage || 1;
    // limit = limit || 10;
    // const startIndex = (currentPage - 1) * limit;
    // const endIndex = currentPage * limit;
    // const paginatedResults = productsWithBrandAndWarehouses.slice(
    //   startIndex,
    //   endIndex,
    // );

    // console.log('paginatedResults products found', paginatedResults.length);

    // Calculate pagination metadata
    // const totalCount = productsWithBrandAndWarehouses.length;
    // const totalPages = Math.ceil(totalCount / limit);
    // const firstPageUrl = `/search/products/?page=1&limit=${limit}`;
    // const previousPageUrl =
    //   currentPage > 1
    //     ? `/search/products/?page=${currentPage - 1}&limit=${limit}`
    //     : null;
    // const nextPageUrl =
    //   currentPage < totalPages
    //     ? `/search/products/?page=${currentPage + 1}&limit=${limit}`
    //     : null;
    // const lastPageUrl = `/search/products/?page=${totalPages}&limit=${limit}`;

    return {
      // pagination: {
      //   meta: {
      //     totalItems: totalCount,
      //     itemsPerPage: Number(limit),
      //     itemsInCurrentPage: paginatedResults.length,
      //     totalPages,
      //     currentPage: Number(currentPage),
      //   },
      //   links: {
      //     firstPage: firstPageUrl,
      //     previousPage: previousPageUrl,
      //     nextPage: nextPageUrl,
      //     lastPage: lastPageUrl,
      //   },
      // },
      data: {
        products: productsWithBrandAndWarehouses,
      },
    };
  }
}
