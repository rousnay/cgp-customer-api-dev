import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';

import { BrandsDto } from '../dtos/brands.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(): Promise<BrandsDto[]> {
    const query = `
      SELECT id, name, slug, media_id, creator_id, editor_id, active
      FROM brands`;

    const brands = await this.entityManager.query(query);
    return brands;
  }
}
