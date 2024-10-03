import { AppConstants } from '@common/constants/constants';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class WarehouseCategoryService {
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  // async findWarehousesByCategoryId(categoryId: number): Promise<any> {
  //   // Query to fetch category object
  //   const categoryQuery = `
  //       SELECT c.*
  //       FROM categories c
  //       WHERE c.id = ?`;

  //   const categoryResult = await this.entityManager.query(categoryQuery, [
  //     categoryId,
  //   ]);

  //   const warehousesQuery = `
  //       SELECT w.*
  //       FROM warehouses w
  //       INNER JOIN product_warehouse_branch pw ON w.id = pw.warehouse_id
  //       INNER JOIN category_product cp ON pw.product_id = cp.product_id
  //       WHERE cp.category_id = ?`;

  //   const warehouseResults = await this.entityManager.query(warehousesQuery, [
  //     categoryId,
  //   ]);

  //   const warehousesWithDetails = [];
  //   for (const warehouse of warehouseResults) {
  //     const branchesQuery = `SELECT * FROM warehouse_branches WHERE warehouse_id = ?`;
  //     const branchesResults = await this.entityManager.query(branchesQuery, [
  //       warehouse.id,
  //     ]);
  //     const mainBranch =
  //       branchesResults.find(
  //         (branch) => branch.branch_type === 'head office',
  //       ) || {};

  //     const categoriesQuery = `
  //       SELECT c.name
  //       FROM category_product cp
  //       INNER JOIN categories c ON cp.category_id = c.id
  //       WHERE cp.product_id IN (
  //         SELECT pw.product_id
  //         FROM product_warehouse_branch pw
  //         WHERE pw.warehouse_id = ?
  //       )
  //       GROUP BY c.name`;
  //     const categoriesResult = await this.entityManager.query(categoriesQuery, [
  //       warehouse.id,
  //     ]);

  //     const brandsQuery = `
  //       SELECT b.name
  //       FROM products p
  //       INNER JOIN brands b ON p.brand_id = b.id
  //       WHERE p.id IN (
  //         SELECT pw.product_id
  //         FROM product_warehouse_branch pw
  //         WHERE pw.warehouse_id = ?
  //       )
  //       GROUP BY b.name`;
  //     const brandsResult = await this.entityManager.query(brandsQuery, [
  //       warehouse.id,
  //     ]);

  //     warehousesWithDetails.push({
  //       ...warehouse,
  //       main_branch: mainBranch,
  //       categories: categoriesResult.map(
  //         (category: { name: string }) => category.name,
  //       ),
  //       brands: brandsResult.map((brand: { name: string }) => brand.name),
  //     });
  //   }

  //   return {
  //     category: categoryResult[0],
  //     warehouses: warehousesWithDetails,
  //   };
  // }

  async findWarehousesByCategoryId(categoryId: number): Promise<any> {
    // Query to fetch category object
    const categoryQuery = `
        SELECT c.*
        FROM categories c
        WHERE c.id = ?`;

    const categoryResult = await this.entityManager.query(categoryQuery, [
      categoryId,
    ]);

    const warehousesQuery = `
        SELECT w.id, w.name, w.abn_number, w.active, COUNT(DISTINCT pw.product_id) as product_counts
        FROM warehouses w
        INNER JOIN product_warehouse_branch pw ON w.id = pw.warehouse_id
        INNER JOIN category_product cp ON pw.product_id = cp.product_id
        WHERE cp.category_id = ?
        GROUP BY w.id, w.name`;

    const warehouseResults = await this.entityManager.query(warehousesQuery, [
      categoryId,
    ]);

    const warehousesWithDetails = await Promise.all(
      warehouseResults.map(async (warehouse) => {
        // Check for duplicates using a unique key (warehouse_id + branch_id)

        const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

        const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

        const logo = await this.entityManager.query(logo_cloudflare_id_query, [
          warehouse.id,
        ]);

        const thumbnail = await this.entityManager.query(
          thumbnail_cloudflare_id_query,
          [warehouse.id],
        );

        let logo_url = null;
        if (logo.length != 0 && logo[0].cloudflare_id != null) {
          logo_url = `${this.cfMediaBaseUrl}/${this.cfAccountHash}/${logo[0].cloudflare_id}/${this.cfMediaVariant}`;
        }

        let thumbnail_url = null;
        if (thumbnail.length != 0 && thumbnail[0].cloudflare_id != null) {
          thumbnail_url = `${this.cfMediaBaseUrl}/${this.cfAccountHash}/${thumbnail[0].cloudflare_id}/${this.cfMediaVariant}`;
        }

        // Get customer's overall review
        const given_to_id = warehouse.id;
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
          id: warehouse.id,
          name: warehouse.name,
          abn_number: warehouse.abn_number,
          active: warehouse.active,
          logo_url,
          thumbnail_url,
          avg_rating,
        };
      }),
    );

    return {
      data: {
        category: categoryResult[0],
        warehouses: warehousesWithDetails,
      },
    };
  }
  async findWarehousesByCategoryIdPage(
    categoryId: number,
    page: number,
    perPage: number,
  ): Promise<any> {
    page = Number(page);
    perPage = Number(perPage);
    // Query to fetch category object
    const categoryQuery = `
        SELECT c.*
        FROM categories c
        WHERE c.id = ?`;

    const categoryResult = await this.entityManager.query(categoryQuery, [
      categoryId,
    ]);

    const warehousesQuery = `
        SELECT w.id, w.name, w.abn_number, w.active, COUNT(DISTINCT pw.product_id) as product_counts,
        b.id as branch_id,
        b.name as branch_name,
        b.branch_type,
        b.address as branch_address,
        b.latitude as branch_latitude,
        b.longitude as branch_longitude,
        b.active as branch_active
        FROM warehouses w
        INNER JOIN warehouse_branches b ON w.id = b.warehouse_id
        INNER JOIN product_warehouse_branch pw ON w.id = pw.warehouse_id
        INNER JOIN category_product cp ON pw.product_id = cp.product_id
        WHERE cp.category_id = ?
        GROUP BY w.id, w.name LIMIT ? OFFSET ?`;

    const warehouseResults = await this.entityManager.query(warehousesQuery, [
      categoryId,
      perPage,
      (page - 1) * perPage,
    ]);

    const warehousesWithDetails = await Promise.all(
      warehouseResults.map(async (warehouse) => {
        // Check for duplicates using a unique key (warehouse_id + branch_id)

        const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

        const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

        const logo = await this.entityManager.query(logo_cloudflare_id_query, [
          warehouse.id,
        ]);

        const thumbnail = await this.entityManager.query(
          thumbnail_cloudflare_id_query,
          [warehouse.id],
        );

        let logo_url = null;
        if (logo.length != 0 && logo[0].cloudflare_id != null) {
          logo_url = `${this.cfMediaBaseUrl}/${this.cfAccountHash}/${logo[0].cloudflare_id}/${this.cfMediaVariant}`;
        }

        let thumbnail_url = null;
        if (thumbnail.length != 0 && thumbnail[0].cloudflare_id != null) {
          thumbnail_url = `${this.cfMediaBaseUrl}/${this.cfAccountHash}/${thumbnail[0].cloudflare_id}/${this.cfMediaVariant}`;
        }

        // Get customer's overall review
        const given_to_id = warehouse.id;
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
          id: warehouse.id,
          name: warehouse.name,
          abn_number: warehouse.abn_number,
          active: warehouse.active,
          logo_url,
          thumbnail_url,
          avg_rating,
          branch_info: {
            id: warehouse.branch_id,
            name: warehouse.branch_name,
            branch_type: warehouse.branch_type,
            address: warehouse.branch_address,
            latitude: warehouse.branch_latitude,
            longitude: warehouse.branch_longitude,
            active: warehouse.branch_active,
            created_at: warehouse.branch_created_at,
            updated_at: warehouse.branch_updated_at,
          },
        };
      }),
    );

    const total = await this.entityManager.query(
      `SELECT COUNT(DISTINCT w.id) as count
       FROM warehouses w
       INNER JOIN product_warehouse_branch pw ON w.id = pw.warehouse_id
       INNER JOIN category_product cp ON pw.product_id = cp.product_id
       WHERE cp.category_id = ?`,
      [categoryId],
    );

    const per_page = Number(perPage);
    const current_page = Number(page);
    const last_page = Number(Math.ceil(Number(total[0].count) / per_page));
    const first_page_url = '';
    const last_page_url = '';
    const next_page_url = '';
    const prev_page_url = '';
    const path = '';
    const from = Number((page - 1) * perPage + 1);
    const to = Number(page * perPage);

    return {
      data: {
        category: categoryResult[0],
        warehouses: warehousesWithDetails,
      },
      total: Number(total[0].count),
      per_page,
      current_page,
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
}
