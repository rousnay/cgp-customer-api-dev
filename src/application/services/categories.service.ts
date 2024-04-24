import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CategoriesDto } from '../dtos/categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  // async findAll(): Promise<CategoriesDto[]> {
  //   const query = `
  //     SELECT id, name, slug, parent_id, grand_parent_id, serial, active
  //     FROM categories`;

  //   const categories = await this.entityManager.query(query);
  //   return categories;
  // }

  async findAllWithProductCount(): Promise<CategoriesDto[]> {
    const query = `
      SELECT c.id, c.name, c.slug, c.parent_id, c.grand_parent_id, c.serial, c.active,
          COUNT(cp.product_id) AS product_count
      FROM categories c
      LEFT JOIN category_product cp ON c.id = cp.category_id
      GROUP BY c.id, c.name, c.slug, c.parent_id, c.grand_parent_id, c.serial, c.active`;

    const categoriesWithCount = await this.entityManager.query(query);
    return categoriesWithCount;
  }

  async findSubcategoriesWithProductCountByParentId(
    parentId: number,
  ): Promise<CategoriesDto[]> {
    const query = `
      SELECT c.id, c.name, c.slug, c.parent_id, c.grand_parent_id, c.serial, c.active,
          COUNT(cp.product_id) AS product_count
      FROM categories c
      LEFT JOIN category_product cp ON c.id = cp.category_id
      WHERE c.parent_id = ?
      GROUP BY c.id, c.name, c.slug, c.parent_id, c.grand_parent_id, c.serial, c.active`;

    const subcategoriesWithCount = await this.entityManager.query(query, [
      parentId,
    ]);
    return subcategoriesWithCount;
  }
}
