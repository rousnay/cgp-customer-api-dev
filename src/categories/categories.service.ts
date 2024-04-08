import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CategoriesDto } from './categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(): Promise<CategoriesDto[]> {
    const query = `
      SELECT id, name, slug, parent_id, grand_parent_id, serial, active, created_at, updated_at
      FROM categories`;

    const categories = await this.entityManager.query(query);
    return categories;
  }
}
