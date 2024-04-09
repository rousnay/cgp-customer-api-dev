import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { WarehouseBranchDto } from '../dtos/warehouse-branch.dto';

@Injectable()
export class WarehouseBranchService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findAllByWarehouseId(
    warehouseId: number,
  ): Promise<WarehouseBranchDto[]> {
    const query = `
      SELECT
        id,
        warehouse_id,
        branch_type,
        email,
        website,
        phone,
        address,
        contact_person_id,
        contact_person_name,
        contact_person_email,
        contact_person_phone,
        active,
        created_at,
        updated_at
      FROM
        warehouse_branches
      WHERE
        warehouse_id = ?`;

    const branches = await this.entityManager.query(query, [warehouseId]);
    return branches;
  }

  async findWarehouseBranchById(branchId: number): Promise<WarehouseBranchDto> {
    const query = `
      SELECT *
      FROM warehouse_branches
      WHERE id = ?`;

    const branch = await this.entityManager.query(query, [branchId]);
    return branch[0]; // Assuming branchId is unique and returns only one record
  }
}
