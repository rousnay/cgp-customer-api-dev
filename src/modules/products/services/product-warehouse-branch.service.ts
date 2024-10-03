import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AppConstants } from '@common/constants/constants';
import { ConfigService } from '@config/config.service';

@Injectable()
export class ProductWarehouseBranchService {
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

  async findProductsByBranchId(branchId: number): Promise<any> {
    // Fetch branch and associated warehouse data
    const branchQuery = `
        SELECT
            wb.*, w.id AS warehouse_id, w.name AS warehouse_name, w.abn_number AS warehouse_abn_number, w.active AS warehouse_active
        FROM
            warehouse_branches wb
        LEFT JOIN
            warehouses w ON wb.warehouse_id = w.id
        WHERE
            wb.id = ?`;
    const branchResult = await this.entityManager.query(branchQuery, [
      branchId,
    ]);
    const branchData = branchResult[0]; // Assuming there's only one branch with the given id

    // Fetching the warehouse logo and thumbnail using the warehouse ID from branchData
    const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
    FROM cf_media cf
    WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

    const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
    FROM cf_media cf
    WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

    const logo = await this.entityManager.query(logo_cloudflare_id_query, [
      branchData.warehouse_id,
    ]);

    const thumbnail = await this.entityManager.query(
      thumbnail_cloudflare_id_query,
      [branchData.warehouse_id],
    );

    let logo_url = null;

    if (logo.length != 0 && logo[0].cloudflare_id != null) {
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

    if (thumbnail.length != 0 && thumbnail[0].cloudflare_id != null) {
      thumbnail_url =
        this.cfMediaBaseUrl +
        '/' +
        this.cfAccountHash +
        '/' +
        thumbnail[0].cloudflare_id +
        '/' +
        this.cfMediaVariant;
    }

    // Get warehouse's overall review
    const given_to_id = branchData.warehouse_id;
    const result = await this.entityManager.query(
      'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(rating) as total_ratings FROM overall_reviews WHERE given_to_id = ? AND given_to_type_id=20',
      [given_to_id],
    );

    const averageRating = result[0].average_rating || 0;
    const totalRatings = result[0].total_ratings || 0;

    const warehouse_avg_rating = {
      average_rating: Number(averageRating),
      total_ratings: Number(totalRatings),
    };

    const productsQuery = `
    SELECT
        pw.id,
        pw.product_name,
        pw.regular_price,
        pw.sales_price,
        pw.active,
        pw.has_own_product_img,
        p.unit,
        p.size_id,
        p.size_height,
        p.size_width,
        p.size_length,
        p.colour_id,
        p.weight,
        p.weight_unit_id,
        p.materials,
        p.short_desc,
        c.name AS category_name,
        b.name AS brand_name,
        p.created_at,
        p.updated_at
    FROM
        products p
    LEFT JOIN
        brands b ON p.brand_id = b.id
    LEFT JOIN
        categories c ON p.category_id = c.id
    LEFT JOIN
        product_warehouse_branch pw ON p.id = pw.product_id
    WHERE
        pw.warehouse_branch_id = ?`;

    const productResults = await this.entityManager.query(productsQuery, [
      branchId,
    ]);

    const productsData = [];
    for (const product of productResults) {
      const product_cloudflare_id_query = `SELECT cf.cloudflare_id FROM cf_media cf WHERE cf.model = 'App\\\\Models\\\\Product' AND cf.model_id = ?`;

      const product_cloudflare_id_result = await this.entityManager.query(
        product_cloudflare_id_query,
        [product.id],
      );

      const img_urls = [];

      product_cloudflare_id_result.map((item) => {
        if (item && item.cloudflare_id != null) {
          const url =
            this.cfMediaBaseUrl +
            '/' +
            this.cfAccountHash +
            '/' +
            item.cloudflare_id +
            '/' +
            this.cfMediaVariant;
          img_urls.push(url);
        }
      });

      productsData.push({
        ...product, // Include all other properties from the product
        img_urls, //image urls
      });
    }

    // Prepare the final response with the desired structure
    const {
      warehouse_id,
      warehouse_name,
      warehouse_abn_number,
      warehouse_active,
      ...branchInfoOnly
    } = branchData;
    return {
      data: {
        id: warehouse_id,
        name: warehouse_name,
        abn_number: warehouse_abn_number,
        active: warehouse_active,
        logo_url: logo_url,
        thumbnail_url: thumbnail_url,
        avg_rating: warehouse_avg_rating,
        branch_info: branchInfoOnly,
        products: productsData,
      },
    };
  }
  async findProductsByBranchIdPage(
    branchId: number,
    paginationQuery?: any,
  ): Promise<any> {
    const { page = 1, perPage = 10 } = paginationQuery;
    // Fetch branch and associated warehouse data
    const branchQuery = `
        SELECT
            wb.*, w.id AS warehouse_id, w.name AS warehouse_name, w.abn_number AS warehouse_abn_number, w.active AS warehouse_active
        FROM
            warehouse_branches wb
        LEFT JOIN
            warehouses w ON wb.warehouse_id = w.id
        WHERE
            wb.id = ?`;
    const branchResult = await this.entityManager.query(branchQuery, [
      branchId,
    ]);
    const branchData = branchResult[0]; // Assuming there's only one branch with the given id

    // Fetching the warehouse logo and thumbnail using the warehouse ID from branchData
    const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
    FROM cf_media cf
    WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

    const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
    FROM cf_media cf
    WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

    const logo = await this.entityManager.query(logo_cloudflare_id_query, [
      branchData.warehouse_id,
    ]);

    const thumbnail = await this.entityManager.query(
      thumbnail_cloudflare_id_query,
      [branchData.warehouse_id],
    );

    let logo_url = null;

    if (logo.length != 0 && logo[0].cloudflare_id != null) {
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

    if (thumbnail.length != 0 && thumbnail[0].cloudflare_id != null) {
      thumbnail_url =
        this.cfMediaBaseUrl +
        '/' +
        this.cfAccountHash +
        '/' +
        thumbnail[0].cloudflare_id +
        '/' +
        this.cfMediaVariant;
    }

    // Get warehouse's overall review
    const given_to_id = branchData.warehouse_id;
    const result = await this.entityManager.query(
      'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(rating) as total_ratings FROM overall_reviews WHERE given_to_id = ? AND given_to_type_id=20',
      [given_to_id],
    );

    const averageRating = result[0].average_rating || 0;
    const totalRatings = result[0].total_ratings || 0;

    const warehouse_avg_rating = {
      average_rating: Number(averageRating),
      total_ratings: Number(totalRatings),
    };

    const productsQuery = `
    SELECT
        pw.id,
        pw.product_name,
        pw.regular_price,
        pw.sales_price,
        pw.active,
        pw.has_own_product_img,
        p.unit,
        p.size_id,
        p.size_height,
        p.size_width,
        p.size_length,
        p.colour_id,
        p.weight,
        p.weight_unit_id,
        p.materials,
        p.short_desc,
        c.name AS category_name,
        b.name AS brand_name,
        p.created_at,
        p.updated_at
    FROM
        products p
    LEFT JOIN
        brands b ON p.brand_id = b.id
    LEFT JOIN
        categories c ON p.category_id = c.id
    LEFT JOIN
        product_warehouse_branch pw ON p.id = pw.product_id
    WHERE
        pw.warehouse_branch_id = ? LIMIT ? OFFSET ?`;

    const productResults = await this.entityManager.query(productsQuery, [
      branchId,
      Number(perPage),
      Number((page - 1) * Number(perPage)),
    ]);

    const total = await this.entityManager.query(
      ` SELECT
        COUNT(pw.id) as count
    FROM
        products p
    LEFT JOIN
        brands b ON p.brand_id = b.id
    LEFT JOIN
        categories c ON p.category_id = c.id
    LEFT JOIN
        product_warehouse_branch pw ON p.id = pw.product_id
    WHERE
        pw.warehouse_branch_id = ?`,
      [branchId],
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

    const productsData = [];
    for (const product of productResults) {
      const product_cloudflare_id_query = `SELECT cf.cloudflare_id FROM cf_media cf WHERE cf.model = 'App\\\\Models\\\\Product' AND cf.model_id = ?`;

      const product_cloudflare_id_result = await this.entityManager.query(
        product_cloudflare_id_query,
        [product.id],
      );

      const img_urls = [];

      product_cloudflare_id_result.map((item) => {
        if (item && item.cloudflare_id != null) {
          const url =
            this.cfMediaBaseUrl +
            '/' +
            this.cfAccountHash +
            '/' +
            item.cloudflare_id +
            '/' +
            this.cfMediaVariant;
          img_urls.push(url);
        }
      });

      productsData.push({
        ...product, // Include all other properties from the product
        img_urls, //image urls
      });
    }

    // Prepare the final response with the desired structure
    const {
      warehouse_id,
      warehouse_name,
      warehouse_abn_number,
      warehouse_active,
      ...branchInfoOnly
    } = branchData;
    return {
      data: {
        id: warehouse_id,
        name: warehouse_name,
        abn_number: warehouse_abn_number,
        active: warehouse_active,
        logo_url: logo_url,
        thumbnail_url: thumbnail_url,
        avg_rating: warehouse_avg_rating,
        branch_info: branchInfoOnly,
        products: productsData,
      },
      total: Number(total[0].count),
      per_page: per_page,
      current_page: current_page,
      last_page: last_page,
      first_page_url: first_page_url,
      last_page_url: last_page_url,
      next_page_url: next_page_url,
      prev_page_url: prev_page_url,
      path: path,
      from: from,
      to: to,
    };
  }
}
