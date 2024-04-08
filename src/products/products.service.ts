// product.service.ts
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ProductsDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(): Promise<ProductsDto[]> {
    const query = `
      SELECT
        id,
        name,
        slug,
        barcode,
        product_type_id,
        category_id,
        primary_category_id,
        brand_id,
        unit_type_id,
        unit,
        size_id,
        colour_id,
        group_id,
        weight,
        short_desc,
        long_desc,
        details_overview,
        details_specifications,
        details_size_and_materials,
        status_id,
        active,
        creator_id,
        editor_id,
        created_at,
        updated_at,
        deleted_at
      FROM
        products`;

    const results = await this.entityManager.query(query);
    return results;
  }

  async findOne(id: number): Promise<ProductsDto | undefined> {
    const query = `
      SELECT
        id,
        name,
        slug,
        barcode,
        product_type_id,
        category_id,
        primary_category_id,
        brand_id,
        unit_type_id,
        unit,
        size_id,
        colour_id,
        group_id,
        weight,
        short_desc,
        long_desc,
        details_overview,
        details_specifications,
        details_size_and_materials,
        status_id,
        active,
        creator_id,
        editor_id,
        created_at,
        updated_at,
        deleted_at
      FROM
        products
      WHERE
        id = ?`;

    // const result = await this.entityManager.query(query, { id });
    const result = await this.entityManager.query(query, [id]);

    return result[0];
  }
}
