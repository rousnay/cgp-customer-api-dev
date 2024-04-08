import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { WarehousesDto } from '../dtos/warehouses.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(): Promise<WarehousesDto[]> {
    const query = `
      SELECT
        id,
        name,
        abn_number,
        active,
        created_at,
        updated_at
      FROM
        warehouses`;

    const results = await this.entityManager.query(query);
    return results;
  }

  async findOne(id: number): Promise<WarehousesDto> {
    const query = `
      SELECT
        id,
        name,
        abn_number,
        active,
        created_at,
        updated_at
      FROM
        warehouses
      WHERE
        id = ?`;

    const result = await this.entityManager.query(query, [id]);
    if (!result[0]) {
      throw new NotFoundException(`Warehouse with id ${id} not found`);
    }
    return result[0];
  }
}
