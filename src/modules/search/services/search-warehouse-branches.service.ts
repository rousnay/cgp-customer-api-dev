import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AppConstants } from '@common/constants/constants';
import { ConfigService } from '@config/config.service';

@Injectable()
export class SearchWarehouseBranchesService {
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  constructor(
    private readonly entityManager: EntityManager,
    configService: ConfigService,
  ) {
    this.cfAccountHash = configService.cloudflareAccountHash;
  }

  async searchWarehouseBranches(query: string): Promise<any> {
    const warehousesQuery = `
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
      CASE
        WHEN UPPER(w.name) LIKE ? THEN 1
        WHEN UPPER(c.name) LIKE ? THEN 2
        ELSE 3
      END as relevance
    FROM
      warehouses w
    LEFT JOIN
      warehouse_branches b ON w.id = b.warehouse_id
    LEFT JOIN
      product_warehouse_branch pw ON w.id = pw.warehouse_id
    LEFT JOIN
      products p ON pw.product_id = p.id
    LEFT JOIN
      categories c ON p.category_id = c.id
    WHERE
      (UPPER(p.name) LIKE ?
      OR UPPER(w.name) LIKE ?
      OR UPPER(c.name) LIKE ?)
    ORDER BY
      relevance, w.name, c.name, p.name`;

    const parameters = [
      `%${query.toUpperCase()}%`, // For sorting by warehouse
      `%${query.toUpperCase()}%`, // For sorting by category
      `%${query.toUpperCase()}%`, // For filtering by product name
      `%${query.toUpperCase()}%`, // For filtering by warehouse name
      `%${query.toUpperCase()}%`, // For filtering by category name
    ];

    const warehousesResults = await this.entityManager.query(
      warehousesQuery,
      parameters,
    );

    const uniqueResults = new Map();

    const warehousesWithDetails = await Promise.all(
      warehousesResults.map(async (warehouse) => {
        // Check for duplicates using a unique key (warehouse_id + branch_id)
        const uniqueKey = `${warehouse.id}-${warehouse.branch_id}`;
        if (uniqueResults.has(uniqueKey)) {
          return null;
        }
        uniqueResults.set(uniqueKey, true);

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

    // Filter out null values resulting from duplicate checks
    const filteredResults = warehousesWithDetails.filter(
      (item) => item !== null,
    );

    return {
      data: filteredResults || [],
    };
  }
  async searchWarehouseBranchesPage(
    query: string,
    page = 1,
    perPage = 20,
  ): Promise<any> {
    page = Number(page);
    perPage = Number(perPage);
    const warehousesQuery = `
       SELECT
          w.id AS id,
          w.name AS name,
          w.abn_number AS abn_number,
          w.active AS active,
          b.id AS branch_id,
          b.name AS branch_name,
          b.branch_type,
          b.address AS branch_address,
          b.latitude AS branch_latitude,
          b.longitude AS branch_longitude,
          b.active AS branch_active,
          CASE
            WHEN UPPER(w.name) LIKE ? THEN 1
            WHEN UPPER(c.name) LIKE ? THEN 2
            ELSE 3
          END AS relevance
        FROM
          warehouses w
        LEFT JOIN
          warehouse_branches b ON w.id = b.warehouse_id
        LEFT JOIN
          product_warehouse_branch pw ON w.id = pw.warehouse_id
        LEFT JOIN
          products p ON pw.product_id = p.id
        LEFT JOIN
          categories c ON p.category_id = c.id
        WHERE
          (UPPER(p.name) LIKE ?
          OR UPPER(w.name) LIKE ?
          OR UPPER(c.name) LIKE ?)
          AND w.id IS NOT NULL
        GROUP BY
          w.id, w.name, w.abn_number, w.active, b.id, b.name, b.branch_type, b.address, b.latitude, b.longitude, b.active
        ORDER BY
          relevance, w.name, c.name, p.name
        LIMIT ? OFFSET ?;`;

    const parameters = [
      `%${query.toUpperCase()}%`, // For sorting by warehouse
      `%${query.toUpperCase()}%`, // For sorting by category
      `%${query.toUpperCase()}%`, // For filtering by product name
      `%${query.toUpperCase()}%`, // For filtering by warehouse name
      `%${query.toUpperCase()}%`, // For filtering by category name
      perPage, // Limit
      (page - 1) * perPage, // Offset
    ];

    const warehousesResults = await this.entityManager.query(
      warehousesQuery,
      parameters,
    );

    // for pagination
    const total = await this.entityManager.query(
      `SELECT COUNT(*) AS count
FROM (
    SELECT
      w.id AS id,
      w.name AS name,
      w.abn_number AS abn_number,
      w.active AS active,
      b.id AS branch_id,
      b.name AS branch_name,
      b.branch_type,
      b.address AS branch_address,
      b.latitude AS branch_latitude,
      b.longitude AS branch_longitude,
      b.active AS branch_active,
      CASE
        WHEN UPPER(w.name) LIKE ? THEN 1
        WHEN UPPER(c.name) LIKE ? THEN 2
        ELSE 3
      END AS relevance
    FROM
      warehouses w
    LEFT JOIN
      warehouse_branches b ON w.id = b.warehouse_id
    LEFT JOIN
      product_warehouse_branch pw ON w.id = pw.warehouse_id
    LEFT JOIN
      products p ON pw.product_id = p.id
    LEFT JOIN
      categories c ON p.category_id = c.id
    WHERE
      (UPPER(p.name) LIKE ?
      OR UPPER(w.name) LIKE ?
      OR UPPER(c.name) LIKE ?)
      AND w.id IS NOT NULL
    GROUP BY
      w.id, w.name, w.abn_number, w.active, b.id, b.name, b.branch_type, b.address, b.latitude, b.longitude, b.active
) AS subquery;
`,
      parameters,
    );

    // for pagination
    const per_page = perPage;
    const current_page = page;
    const last_page = Number(Math.ceil(total[0].count / per_page));
    const first_page_url = '';
    const last_page_url = '';
    const next_page_url = '';
    const prev_page_url = '';
    const path = '';
    const from = (page - 1) * perPage + 1;
    const to = page * perPage;

    const uniqueResults = new Map();

    const warehousesWithDetails = await Promise.all(
      warehousesResults.map(async (warehouse) => {
        // Check for duplicates using a unique key (warehouse_id + branch_id)
        const uniqueKey = `${warehouse.id}-${warehouse.branch_id}`;
        if (uniqueResults.has(uniqueKey)) {
          return null;
        }
        uniqueResults.set(uniqueKey, true);

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
    // Filter out null values resulting from duplicate checks
    const filteredResults = warehousesWithDetails.filter(
      (item) => item !== null,
    );

    return {
      data: filteredResults || [],
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
