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
      productsWithBrandData.push({
        ...productData, // Include all other properties from the product
        brand_name: brandData.name, // Add the brand data as a separate object
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

    // Return product data with brand data as a separate object
    return {
      ...productData,
      brand: brandData,
    };
  }
}
