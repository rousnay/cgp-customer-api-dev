import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AppConstants } from '@common/constants/constants';
import { ConfigService } from '@config/config.service';
import { WarehouseBranchDto } from '../dtos/warehouse-branch.dto';

@Injectable()
export class WarehouseBranchService {
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    configService: ConfigService,
  ) {
    this.cfAccountHash = configService.cloudflareAccountHash;
  }

  async findAll({ page = 1, perPage = 20 }: any): Promise<any> {
    page = Number(page);
    perPage = Number(perPage);
    const query = `
    SELECT
      w.id as id,
      w.name as name,
      w.abn_number as abn_number,
      w.active as active,
      b.id as branch_id,
      b.name as branch_name,
      b.branch_type,
      b.address as branch_address,
      b.latitude as branch_latitude,
      b.longitude as branch_longitude,
      b.active as branch_active,
      b.created_at as branch_created_at,
      b.updated_at as branch_updated_at
    FROM
      warehouses w
    LEFT JOIN
      warehouse_branches b ON w.id = b.warehouse_id LIMIT ? OFFSET ?`;

    const branchesResults = await this.entityManager.query(query, [
      perPage,
      (page - 1) * perPage,
    ]);

    const total = await this.entityManager.query(
      `SELECT COUNT(*) as count  
    FROM
      warehouses w
    LEFT JOIN
      warehouse_branches b ON w.id = b.warehouse_id`,
    );
    const per_page = Number(perPage);
    const current_page = Number(page);
    const last_page = Number(Math.ceil(total[0].count / per_page));
    const first_page_url = '';
    const last_page_url = '';
    const next_page_url = '';
    const prev_page_url = '';
    const path = '';
    const from = Number((page - 1) * perPage + 1);
    const to = Number(page * perPage);

    const branchesWithDetails = await Promise.all(
      branchesResults.map(async (branch) => {
        const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

        const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

        const logo = await this.entityManager.query(logo_cloudflare_id_query, [
          branch.id,
        ]);

        const thumbnail = await this.entityManager.query(
          thumbnail_cloudflare_id_query,
          [branch.id],
        );

        let logo_url = null;
        if (logo.length !== 0 && logo[0].cloudflare_id != null) {
          logo_url = `${this.cfMediaBaseUrl}/${this.cfAccountHash}/${logo[0].cloudflare_id}/${this.cfMediaVariant}`;
        }

        let thumbnail_url = null;
        if (thumbnail.length !== 0 && thumbnail[0].cloudflare_id != null) {
          thumbnail_url = `${this.cfMediaBaseUrl}/${this.cfAccountHash}/${thumbnail[0].cloudflare_id}/${this.cfMediaVariant}`;
        }

        // Get customer's overall review
        const given_to_id = branch.id;
        const result = await this.entityManager.query(
          'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(rating) as total_ratings FROM overall_reviews WHERE given_to_id = ? AND given_to_type_id=20',
          [given_to_id],
        );

        const averageRating = result[0].average_rating || 0;
        const totalRatings = result[0].total_ratings || 0;

        const avg_rating = {
          average_rating: Number(averageRating),
          total_ratings: Number(totalRatings),
        };

        return {
          id: branch.id,
          name: branch.name,
          abn_number: branch.abn_number,
          active: branch.active,
          logo_url,
          thumbnail_url,
          avg_rating,
          branch_info: {
            id: branch.branch_id,
            name: branch.branch_name,
            branch_type: branch.branch_type,
            address: branch.branch_address,
            latitude: branch.branch_latitude,
            longitude: branch.branch_longitude,
            active: branch.branch_active,
            created_at: branch.branch_created_at,
            updated_at: branch.branch_updated_at,
          },
        };
      }),
    );
    return {
      data: branchesWithDetails,
      total: Number(total[0].count),
      current_page,
      per_page,
      last_page,
      first_page_url,
      last_page_url,
      next_page_url,
      prev_page_url,
      path,
      from,
      to,
    };
  }
  async findAllWithOutPage(): Promise<any> {
    const query = `
    SELECT
      w.id as id,
      w.name as name,
      w.abn_number as abn_number,
      w.active as active,
      b.id as branch_id,
      b.name as branch_name,
      b.branch_type,
      b.address as branch_address,
      b.latitude as branch_latitude,
      b.longitude as branch_longitude,
      b.active as branch_active,
      b.created_at as branch_created_at,
      b.updated_at as branch_updated_at
    FROM
      warehouses w
    LEFT JOIN
      warehouse_branches b ON w.id = b.warehouse_id`;

    const branchesResults = await this.entityManager.query(query);

    const branchesWithDetails = await Promise.all(
      branchesResults.map(async (branch) => {
        const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

        const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

        const logo = await this.entityManager.query(logo_cloudflare_id_query, [
          branch.id,
        ]);

        const thumbnail = await this.entityManager.query(
          thumbnail_cloudflare_id_query,
          [branch.id],
        );

        let logo_url = null;
        if (logo.length !== 0 && logo[0].cloudflare_id != null) {
          logo_url = `${this.cfMediaBaseUrl}/${this.cfAccountHash}/${logo[0].cloudflare_id}/${this.cfMediaVariant}`;
        }

        let thumbnail_url = null;
        if (thumbnail.length !== 0 && thumbnail[0].cloudflare_id != null) {
          thumbnail_url = `${this.cfMediaBaseUrl}/${this.cfAccountHash}/${thumbnail[0].cloudflare_id}/${this.cfMediaVariant}`;
        }

        // Get customer's overall review
        const given_to_id = branch.id;
        const result = await this.entityManager.query(
          'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(rating) as total_ratings FROM overall_reviews WHERE given_to_id = ? AND given_to_type_id=20',
          [given_to_id],
        );

        const averageRating = result[0].average_rating || 0;
        const totalRatings = result[0].total_ratings || 0;

        const avg_rating = {
          average_rating: Number(averageRating),
          total_ratings: Number(totalRatings),
        };

        return {
          id: branch.id,
          name: branch.name,
          abn_number: branch.abn_number,
          active: branch.active,
          logo_url,
          thumbnail_url,
          avg_rating,
          branch_info: {
            id: branch.branch_id,
            name: branch.branch_name,
            branch_type: branch.branch_type,
            address: branch.branch_address,
            latitude: branch.branch_latitude,
            longitude: branch.branch_longitude,
            active: branch.branch_active,
            created_at: branch.branch_created_at,
            updated_at: branch.branch_updated_at,
          },
        };
      }),
    );
    return {
      data: branchesWithDetails,
    };
  }

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

  async findAllBranchesByWarehouseId(
    warehouseId: number,
    { page, perPage }: any,
  ): Promise<any> {
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
      WHERE b.warehouse_id = ? LIMIT ? OFFSET ?`;

    const otherBranchesResult = await this.entityManager.query(branchesQuery, [
      warehouseId,
      perPage,
      (page - 1) * perPage,
    ]);

    const total = await this.entityManager.query(
      `SELECT COUNT(*) as count
      FROM warehouse_branches b
      WHERE b.warehouse_id = ?`,
      [warehouseId],
    );

    const per_page = Number(perPage);
    const current_page = Number(page);
    const last_page = Number(Math.ceil(total[0].count / per_page));
    const first_page_url = '';
    const last_page_url = '';
    const next_page_url = '';
    const prev_page_url = '';
    const path = '';
    const from = Number((page - 1) * perPage + 1);
    const to = Number(page * perPage);

    return {
      data: {
        warehouse: { ...warehouseResult[0], main_branch: mainBranchResult[0] },
        branches: otherBranchesResult,
      },
      total: Number(total[0].count),
      current_page,
      per_page,
      last_page,
      first_page_url,
      last_page_url,
      next_page_url,
      prev_page_url,
      path,
      from,
      to,
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
      data: {
        ...branch[0],
        warehouse: { ...warehouseResult[0], main_branch: mainBranchResult[0] },
      },
    };
  }
}
