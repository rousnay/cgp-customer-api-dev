import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';

import { WarehousesDto } from '../dtos/warehouses.dto';
import { AppConstants } from '@common/constants/constants';
import { ConfigService } from '@config/config.service';

@Injectable()
export class WarehousesService {
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  findWarehousesByCategoryId(categoryId: number) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    configService: ConfigService,
  ) {
    this.cfAccountHash = configService.cloudflareAccountHash;
  }

  async findAll(): Promise<any> {
    // Fetch all warehouses with unique categories and brands
    const warehousesQuery = `SELECT w.*,
    GROUP_CONCAT(DISTINCT b.id) as branch_ids,
    GROUP_CONCAT(DISTINCT b.branch_type) as branch_types,
    GROUP_CONCAT(DISTINCT c.name SEPARATOR '|,|') as category_names,
    GROUP_CONCAT(DISTINCT br.name) as brand_names
    FROM warehouses w
    LEFT JOIN warehouse_branches b ON w.id = b.warehouse_id
    LEFT JOIN product_warehouse_branch pw ON w.id = pw.warehouse_id
    LEFT JOIN category_product cp ON pw.product_id = cp.product_id
    LEFT JOIN categories c ON cp.category_id = c.id
    LEFT JOIN products p ON pw.product_id = p.id
    LEFT JOIN brands br ON p.brand_id = br.id
    GROUP BY w.id`;

    const warehousesResults = await this.entityManager.query(warehousesQuery);

    // Process each warehouse
    const warehousesWithDetails = await Promise.all(
      warehousesResults.map(async (warehouse) => {
        const branchIds = warehouse.branch_ids
          ? warehouse.branch_ids.split(',')
          : [];
        const branchTypes = warehouse.branch_types
          ? warehouse.branch_types.split(',')
          : [];
        const categoryNames = warehouse.category_names
          ? warehouse.category_names.split('|,|')
          : [];
        const brandNames = warehouse.brand_names
          ? warehouse.brand_names.split(',').map((name) => name.trim())
          : [];

        const mainBranchIndex = branchTypes.findIndex(
          (type) => type === 'head office',
        );
        const mainBranchId =
          mainBranchIndex !== -1 ? branchIds[mainBranchIndex] : null;

        let mainBranch = null;
        if (mainBranchId) {
          const mainBranchQuery = `SELECT * FROM warehouse_branches WHERE id = ?`;
          mainBranch = await this.entityManager.query(mainBranchQuery, [
            mainBranchId,
          ]);
        }

        const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

        const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

        const logo = await this.entityManager.query(logo_cloudflare_id_query,[
          warehouse.id
        ]);

        const thumbnail = await this.entityManager.query(thumbnail_cloudflare_id_query,[
          warehouse.id
        ]);

        let logo_url = null;

        if(logo.length != 0 && logo[0].cloudflare_id != null){
          logo_url =
          this.cfMediaBaseUrl +
          '/' +
          this.cfAccountHash +
          '/' +
          logo[0].cloudflare_id +
          '/' +
          this.cfMediaVariant;
        }

        let thumbnail_url = null;

        if(thumbnail.length != 0 && thumbnail[0].cloudflare_id != null){
          thumbnail_url =
          this.cfMediaBaseUrl +
          '/' +
          this.cfAccountHash +
          '/' +
          thumbnail[0].cloudflare_id +
          '/' +
          this.cfMediaVariant;
        }


        // console.log('logo_url',logo_url);

        // Exclude extra fields from the main object
        delete warehouse.branch_ids;
        delete warehouse.branch_types;
        delete warehouse.category_names;
        delete warehouse.brand_names;

        return {
          ...warehouse,
          logo_url:logo_url,
          thumbnail_url:thumbnail_url,
          main_branch:mainBranch && mainBranch.length > 0 ? mainBranch[0] : null,
          categories: categoryNames,
          brands: brandNames,
        };
      }),
    );

    return {
      data: warehousesWithDetails,
    };
  }

  async findOne(id: number): Promise<any> {
    const warehouseQuery = `
      SELECT w.*
      FROM warehouses w
      WHERE w.id = ?`;

    const warehouseResult = await this.entityManager.query(warehouseQuery, [
      id,
    ]);
    if (!warehouseResult[0]) {
      throw new NotFoundException(`Warehouse with id ${id} not found`);
    }

    const mainBranchQuery = `
      SELECT b.*
      FROM warehouse_branches b
      WHERE b.warehouse_id = ? AND b.branch_type = 'head office'`;

    const mainBranchResult = await this.entityManager.query(mainBranchQuery, [
      id,
    ]);

    const branchesQuery = `SELECT * FROM warehouse_branches WHERE warehouse_id = ?`;
    const branchesResults = await this.entityManager.query(branchesQuery, [id]);

    const categoriesQuery = `
      SELECT c.*
      FROM category_product cp
      INNER JOIN categories c ON cp.category_id = c.id
      WHERE cp.product_id IN (
        SELECT pw.product_id
        FROM product_warehouse_branch pw
        WHERE pw.warehouse_id = ?
      )
      GROUP BY c.id`;

    const categoriesResult = await this.entityManager.query(categoriesQuery, [
      id,
    ]);

    const brandsQuery = `
      SELECT b.*
      FROM products p
      INNER JOIN brands b ON p.brand_id = b.id
      WHERE p.id IN (
        SELECT pw.product_id
        FROM product_warehouse_branch pw
        WHERE pw.warehouse_id = ?
      )
      GROUP BY b.id`;

    const brandsResult = await this.entityManager.query(brandsQuery, [id]);

    // let thumbnail_url = null;

    // if (vehicle.vehicle_image_cf_media_id != null) {
    // const cloudflare_id = await this.entityManager
    //   .createQueryBuilder()
    //   .select(['cf.cloudflare_id'])
    //   .from('cf_media', 'cf')
    //   .where('cf.id = :id', { id: vehicle.vehicle_image_cf_media_id })
    //   .getRawOne();

    const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
      FROM cf_media cf
      WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

    const thumbnail_cloudflare_id_result = await this.entityManager.query(
      thumbnail_cloudflare_id_query,
      [id],
    );

    console.log(
      'thumbnail_cloudflare_id_result',
      thumbnail_cloudflare_id_result[0].cloudflare_id,
    );

    const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
      FROM cf_media cf
      WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

    const logo_cloudflare_id_result = await this.entityManager.query(
      logo_cloudflare_id_query,
      [id],
    );

    console.log(
      'logo_cloudflare_id_result',
      logo_cloudflare_id_result[0].cloudflare_id,
    );

    const thumbnail_url =
      this.cfMediaBaseUrl +
      '/' +
      this.cfAccountHash +
      '/' +
      thumbnail_cloudflare_id_result[0].cloudflare_id +
      '/' +
      this.cfMediaVariant;

    const logo_url =
      this.cfMediaBaseUrl +
      '/' +
      this.cfAccountHash +
      '/' +
      logo_cloudflare_id_result[0].cloudflare_id +
      '/' +
      this.cfMediaVariant;

    return {
      data: {
        ...warehouseResult[0],
        thumbnail_url,
        logo_url,
        main_branch: mainBranchResult[0],
        branches: branchesResults,
        categories: categoriesResult,
        brands: brandsResult,
      },
    };
  }
}
