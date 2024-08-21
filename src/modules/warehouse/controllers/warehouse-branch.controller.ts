import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WarehouseBranchDto } from '../dtos/warehouse-branch.dto';
import { WarehouseBranchService } from '../services/warehouse-branch.service';

@Controller('warehouses')
@ApiTags('Warehouses')
export class WarehouseBranchController {
  constructor(
    private readonly warehouseBranchService: WarehouseBranchService,
  ) {}

  @Get('branches/all')
  @ApiOperation({ summary: 'Get all branches' })
  @ApiResponse({ status: 404, description: 'No branches found' })
  async findAllWarehouseBranches(): Promise<{
    message: string;
    status: string;
    data: any[];
  }> {
    const results = await this.warehouseBranchService.findAll();
    if (!results) {
      throw new NotFoundException(`No branches found!`);
    }
    return {
      status: 'success',
      message: 'All warehouse branches fetched successfully',
      ...results,
    };
  }

  @Get(':warehouseId/branches')
  @ApiOperation({ summary: 'Get all branches of a warehouse' })
  @ApiResponse({
    status: 200,
    description: 'Get the list of branches by warehouse id',
    content: {
      'application/json': {
        example: {
          message: 'All branches for the warehouse fetched successfully',
          status: 'success',
          data: {
            message: 'All branches for the warehouse fetched successfully',
            status: 'success',
            data: [
              {
                id: '1',
                warehouse_id: 1,
                branch_type: 'head office',
                email: 'info@australianwarehouse1.com',
                website: 'www.australianwarehouse1.com',
                phone: '+611234567890',
                address: '123 Sydney Street, Sydney, NSW 2000',
                contact_person_id: 1,
                contact_person_name: 'John Doe',
                contact_person_email: 'john.doe@australianwarehouse1.com',
                contact_person_phone: '+611234567890',
                active: 1,
                created_at: '2024-04-08T04:00:00.000Z',
                updated_at: '2024-04-08T04:00:00.000Z',
              },
              {
                id: '2',
                warehouse_id: 1,
                branch_type: 'branch office',
                email: 'info@australianwarehouse1.com',
                website: 'www.australianwarehouse1.com',
                phone: '+611234567890',
                address: '456 Melbourne Street, Melbourne, VIC 3000',
                contact_person_id: 2,
                contact_person_name: 'Jane Smith',
                contact_person_email: 'jane.smith@australianwarehouse1.com',
                contact_person_phone: '+611234567890',
                active: 1,
                created_at: '2024-04-08T04:00:00.000Z',
                updated_at: '2024-04-08T04:00:00.000Z',
              },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No branches found for warehouse' })
  async findAllBranchesByWarehouseId(
    @Param('warehouseId') warehouseId: number,
  ): Promise<{ message: string; status: string; data: WarehouseBranchDto[] }> {
    const results =
      await this.warehouseBranchService.findAllBranchesByWarehouseId(
        warehouseId,
      );
    if (!results) {
      throw new NotFoundException(
        `No branches found for warehouse with id ${warehouseId}`,
      );
    }
    return {
      status: 'success',
      message: 'All branches for the warehouse fetched successfully',
      ...results,
    };
  }

  @Get('branches/:branchId')
  @ApiOperation({ summary: 'Get the branches by id' })
  async findWarehouseBranchById(
    @Param('branchId') branchId: number,
  ): Promise<{ message: string; status: string; data: WarehouseBranchDto }> {
    const results = await this.warehouseBranchService.findWarehouseBranchById(
      branchId,
    );
    if (!results) {
      throw new NotFoundException(
        `Warehouse branch with id ${branchId} not found`,
      );
    }
    return {
      status: 'success',
      message: 'Warehouse branch with specified id fetched successfully',
      ...results,
    };
  }
}
