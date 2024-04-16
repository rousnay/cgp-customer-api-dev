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
    const warehousesQuery = `SELECT * FROM warehouses`;

    const warehousesResults = await this.entityManager.query(warehousesQuery);

    const warehousesWithBranches = [];
    for (const warehouse of warehousesResults) {
      const branchesQuery = `SELECT * FROM warehouse_branches WHERE warehouse_id = ?`;
      const branchesResults = await this.entityManager.query(branchesQuery, [
        warehouse.id,
      ]);
      const mainBranch =
        branchesResults.find(
          (branch) => branch.branch_type === 'head office',
        ) || {};
      warehousesWithBranches.push({
        ...warehouse,
        main_branch: mainBranch,
      });
    }

    return warehousesWithBranches;
  }

  async findOne(id: number): Promise<any> {
    const warehouseQuery = `SELECT * FROM warehouses WHERE id = ?`;
    const warehouseResult = await this.entityManager.query(warehouseQuery, [
      id,
    ]);
    if (!warehouseResult[0]) {
      throw new NotFoundException(`Warehouse with id ${id} not found`);
    }

    const branchesQuery = `SELECT * FROM warehouse_branches WHERE warehouse_id = ?`;
    const branchesResult = await this.entityManager.query(branchesQuery, [id]);

    // Separate main branch from other branches
    const mainBranch = branchesResult.find(
      (branch) => branch.branch_type === 'head office',
    );
    const otherBranches = branchesResult.filter(
      (branch) => branch.branch_type !== 'head office',
    );

    // Return warehouse data, main branch data, and other branches data
    const warehouseData = warehouseResult[0];

    return {
      warehouse: warehouseData,
      main_branch: mainBranch || null,
      other_branches: otherBranches,
    };
  }
}
