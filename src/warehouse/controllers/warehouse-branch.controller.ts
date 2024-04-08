import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { WarehouseBranchService } from '../services/warehouse-branch.service';
import { WarehouseBranchDto } from '../dtos/warehouse-branch.dto';

@Controller('warehouses/:warehouseId/branches')
export class WarehouseBranchController {
  constructor(
    private readonly warehouseBranchService: WarehouseBranchService,
  ) {}

  @Get()
  async findAllByWarehouseId(
    @Param('warehouseId') warehouseId: number,
  ): Promise<WarehouseBranchDto[]> {
    const branches = await this.warehouseBranchService.findAllByWarehouseId(
      warehouseId,
    );
    if (!branches) {
      throw new NotFoundException(
        `No branches found for warehouse with id ${warehouseId}`,
      );
    }
    return branches;
  }
}
