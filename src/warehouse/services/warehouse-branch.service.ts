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
        *
      FROM
        warehouse_branches
      WHERE
        warehouse_id = ?`;

    const branches = await this.entityManager.query(query, [warehouseId]);
    return branches;
  }

  async findAllBranchesByWarehouseId(warehouseId: number): Promise<any> {
    const warehouseQuery = `
      SELECT w.*
      FROM warehouses w
      WHERE w.id = ?`;

    const warehouseResult = await this.entityManager.query(warehouseQuery, [
      warehouseId,
    ]);
    if (!warehouseResult[0]) {
      throw new NotFoundException(`Warehouse with id ${warehouseId} not found`);
    }

    const mainBranchQuery = `
      SELECT b.*
      FROM warehouse_branches b
      WHERE b.warehouse_id = ? AND b.branch_type = 'head office'`;

    const mainBranchResult = await this.entityManager.query(mainBranchQuery, [
      warehouseId,
    ]);

    const branchesQuery = `
      SELECT b.*
      FROM warehouse_branches b
      WHERE b.warehouse_id = ? `;

    const otherBranchesResult = await this.entityManager.query(branchesQuery, [
      warehouseId,
    ]);

    return {
      warehouse: { ...warehouseResult[0], main_branch: mainBranchResult[0] },
      branches: otherBranchesResult,
    };
  }

  async findWarehouseBranchById(branchId: number): Promise<any> {
    const query = `
      SELECT *
      FROM warehouse_branches
      WHERE id = ?`;

    const branch = await this.entityManager.query(query, [branchId]);

    const warehouseQuery = `
      SELECT w.*
      FROM warehouses w
      WHERE w.id = ?`;

    const warehouseResult = await this.entityManager.query(warehouseQuery, [
      branch[0].warehouse_id,
    ]);
    if (!warehouseResult[0]) {
      throw new NotFoundException(
        `Warehouse with id ${branch[0].warehouse_id} not found`,
      );
    }

    const mainBranchQuery = `
      SELECT b.*
      FROM warehouse_branches b
      WHERE b.warehouse_id = ? AND b.branch_type = 'head office'`;

    const mainBranchResult = await this.entityManager.query(mainBranchQuery, [
      branch[0].warehouse_id,
    ]);

    return {
      ...branch[0],
      warehouse: { ...warehouseResult[0], main_branch: mainBranchResult[0] },
    };
  }
}
