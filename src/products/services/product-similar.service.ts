import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class SimilarProductsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async getSimilarProducts(productId: number): Promise<any[]> {
    try {
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
          console.log('words:', index, word);
          if (index > 0) {
            query += ` OR`;
          }
          query += ` p.name LIKE ?`;
          parameters.push(`%${word}%`);
        });
      }

      // Fetch the categoryId based on the provided productId
      const categoryIdQuery = `
        SELECT category_id FROM products WHERE id = ?
      `;
      const categoryIdResult = await this.entityManager.query(categoryIdQuery, [
        productId,
      ]);
      const categoryId = categoryIdResult[0]?.category_id;

      if (categoryId) {
        query += ` OR p.category_id = ?`;
        parameters.push(categoryId);
      }

      console.log('categoryId:', categoryId);
      console.log('query:', query);
      console.log('parameters:', parameters);

      // Fetch all products based on the combined conditions
      const similarProducts = await this.entityManager.query(query, parameters);

      // Execute the query
      //   const similarProducts = await this.entityManager.query(query);
      return similarProducts;
    } catch (error) {
      throw new Error('Error fetching similar products: ' + error.message);
    }
  }
}
