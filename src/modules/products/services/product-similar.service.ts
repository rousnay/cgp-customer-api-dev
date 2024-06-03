import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class SimilarProductsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async getSimilarProducts(productId: number): Promise<any> {
    try {
      // Fetch the categoryId based on the provided productId
      const categoryIdQuery = `
        SELECT category_id FROM products WHERE id = ?
      `;
      const categoryIdResult = await this.entityManager.query(categoryIdQuery, [
        productId,
      ]);
      const categoryId = categoryIdResult[0]?.category_id;

      // Fetch all products with the given categoryId
      const categoryProductsQuery = `
        SELECT p.*
        FROM products p
        WHERE p.category_id = ? AND p.id <> ?
      `;
      const categoryProducts = await this.entityManager.query(
        categoryProductsQuery,
        [categoryId, productId],
      );

      const categoryProductsWithBrandAndWarehouseData = [];
      for (const product of categoryProducts) {
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

        const warehouseResults = await this.entityManager.query(
          warehousesQuery,
          [product.id],
        );

        categoryProductsWithBrandAndWarehouseData.push({
          ...productData, // Entire product object
          brand_name: brandData.name, // Add the brand data as a separate object
          warehouses: warehouseResults,
        });
      }

      // Fetch the productName based on the provided productId
      const productNameQuery = `
        SELECT name FROM products WHERE id = ?
      `;
      const productNameResult = await this.entityManager.query(
        productNameQuery,
        [productId],
      );
      const productName = productNameResult[0]?.name || '';

      // Split the product name into individual words
      const words = productName ? productName.trim().split(/\s+/) : [];

      // Build the query dynamically to search for similar products based on product name
      let query = `
        SELECT
            p.*
        FROM
            products p
        WHERE
            p.id <> ? AND
            1 = 0
      `;

      const parameters: any[] = [];

      // Add conditions to search for similar products based on product name
      if (words.length > 0) {
        query = `
          SELECT
              p.*
          FROM
              products p
          WHERE
        `;

        words.forEach((word, index) => {
          if (index > 0) {
            query += ` OR`;
          }
          query += ` p.name LIKE ? AND p.id <> ?`;
          parameters.push(`%${word}%`, productId);
        });
      }

      // Fetch all products based on the combined conditions
      const similarProductsByName = await this.entityManager.query(
        query,
        parameters,
      );

      const similarProductsByNameWithBrandAndWarehouseData = [];
      for (const product of similarProductsByName) {
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

        const warehouseResults = await this.entityManager.query(
          warehousesQuery,
          [product.id],
        );

        similarProductsByNameWithBrandAndWarehouseData.push({
          ...productData, // Entire product object
          brand_name: brandData.name, // Add the brand data as a separate object
          warehouses: warehouseResults,
        });
      }

      const combinedProducts = [
        ...categoryProductsWithBrandAndWarehouseData,
        ...similarProductsByNameWithBrandAndWarehouseData,
      ];

      // Filter products with similar names from the category products
      // const filteredSimilarProducts = allProducts.filter((product) => {
      //   return words.some((word) => product.name.includes(word));
      // });

      // Step 1: Count occurrences of each id
      const idCounts = {};
      combinedProducts.forEach((product) => {
        const id = product.id;
        idCounts[id] = (idCounts[id] || 0) + 1;
      });

      // Step 2: Sort the array based on the count of occurrences
      combinedProducts.sort((a, b) => {
        const countA = idCounts[a.id];
        const countB = idCounts[b.id];
        if (countA === countB) {
          // If counts are equal, maintain the original order
          return 0;
        }
        // Sort in descending order of counts
        return countB - countA;
      });

      // Step 3: Reorder the array items accordingly
      const reorderedProducts = [];
      const processedIds = new Set();
      combinedProducts.forEach((product) => {
        const id = product.id;
        if (!processedIds.has(id)) {
          // Add the item to the beginning if it has 3 occurrences
          if (idCounts[id] >= 3) {
            reorderedProducts.unshift(product);
          } else {
            // Add the item after the first occurrence if it has 2 occurrences
            reorderedProducts.splice(1, 0, product);
          }
          processedIds.add(id);
        }
      });

      // Output the reordered array
      return {
        data: reorderedProducts,
      };
    } catch (error) {
      throw new Error('Error fetching similar products: ' + error.message);
    }
  }
}
