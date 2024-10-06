import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ConfigService } from '@config/config.service';
import { AppConstants } from '@common/constants/constants';
@Injectable()
export class ProductCategoryService {
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

  async findProductsByCategoryId(categoryId: number): Promise<any> {
    // Query to fetch category object
    const categoryQuery = `
        SELECT c.*
        FROM categories c
        WHERE c.id = ?`;

    const categoryResult = await this.entityManager.query(categoryQuery, [
      categoryId,
    ]);

    // Query to fetch products
    const productsQuery = `
     SELECT
        pw.id,
        pw.product_name,
        pw.regular_price,
        pw.sales_price,
        pw.quantity,
        pw.active,
        pw.has_own_product_img,
        p.barcode,
        p.category_id,
        p.primary_category_id,
        p.brand_id,
        p.unit,
        p.size_id,
        p.size_height,
        p.size_width,
        p.size_length,
        p.colour_id,
        p.group_id,
        p.weight,
        p.weight_unit_id,
        p.materials,
        p.short_desc,
        p.long_desc,
        p.details_overview,
        p.details_specifications,
        p.details_size_and_materials,
        p.details_size_and_materials,
        p.created_at,
        p.updated_at,
        w.name AS warehouse_name,
        c.name AS category_name,
        b.name AS brand_name
      FROM
        products p
      LEFT JOIN
        brands b ON p.brand_id = b.id
      LEFT JOIN
        categories c ON p.category_id = c.id
      LEFT JOIN
        product_warehouse_branch pw ON p.id = pw.product_id
      LEFT JOIN
        warehouses w ON pw.warehouse_id = w.id
      WHERE p.category_id = ?`;

    const productResults = await this.entityManager.query(productsQuery, [
      categoryId,
    ]);

    const productsWithCategoryAndWarehouses = [];
    for (const product of productResults) {
      const { brand_id, ...productData } = product; // Destructure the brand_id property
      const brandQuery = `
            SELECT
                *
            FROM
                brands
            WHERE
                id = ?`;
      const brandResult = await this.entityManager.query(brandQuery, [
        brand_id,
      ]);
      const brandData = brandResult[0]; // Assuming there's only one brand with the given id

      // Fetching warehouse data
      const warehousesQuery = `
            SELECT
                pw.warehouse_id,
                w.name AS warehouse_name,
                w.abn_number AS abn_number,
                w.active AS active
            FROM
                product_warehouse_branch pw
            INNER JOIN
                warehouses w ON pw.warehouse_id = w.id
            WHERE
                pw.id = ?`;

      const warehouseResults = await this.entityManager.query(warehousesQuery, [
        product.id,
      ]);

      if (warehouseResults.length > 0) {
        // Prepare an array of promises for fetching ratings
        const ratingPromises = warehouseResults.map(async (warehouse) => {
          const given_to_id = warehouse.id;
          const result = await this.entityManager.query(
            'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(rating) as total_ratings FROM overall_reviews WHERE given_to_id = ? AND given_to_type_id=20',
            [given_to_id],
          );

          const averageRating = result[0]?.average_rating || 0;
          const totalRatings = result[0]?.total_ratings || 0;

          return {
            id: given_to_id,
            avg_rating: {
              average_rating: Number(averageRating),
              total_ratings: Number(totalRatings),
            },
          };
        });

        // Wait for all rating queries to complete
        const ratings = await Promise.all(ratingPromises);

        // Merge ratings back into warehouseResults
        ratings.forEach((rating) => {
          const warehouse = warehouseResults.find((w) => w.id === rating.id);
          if (warehouse) {
            warehouse.avg_rating = rating.avg_rating;
          }
        });
      }

      for (const item of warehouseResults) {
        const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

        const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

        const logo = await this.entityManager.query(logo_cloudflare_id_query, [
          item.warehouse_id,
        ]);

        const thumbnail = await this.entityManager.query(
          thumbnail_cloudflare_id_query,
          [item.warehouse_id],
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

        item.logo_url = logo_url;
        item.thumbnail_url = thumbnail_url;
      }

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

      productsWithCategoryAndWarehouses.push({
        ...productData, // Entire product object
        img_urls, //image urls
        brand_name: brandData.name, // Add the brand data as a separate object
        warehouses: warehouseResults,
      });
    }

    return {
      data: {
        category: categoryResult[0],
        products: productsWithCategoryAndWarehouses,
      },
    };
  }
  async findProductsByCategoryIdPage(
    categoryId: number,
    page: number,
    perPage: number,
  ): Promise<any> {
    // Query to fetch category object
    page = Number(page);
    perPage = Number(perPage);
    const categoryQuery = `
        SELECT c.*
        FROM categories c
        WHERE c.id = ?`;

    const categoryResult = await this.entityManager.query(categoryQuery, [
      categoryId,
    ]);

    // Query to fetch products
    const productsQuery = `
     SELECT
        pw.id,
        pw.product_name,
        pw.regular_price,
        pw.sales_price,
        pw.quantity,
        pw.active,
        pw.has_own_product_img,
        p.barcode,
        p.category_id,
        p.primary_category_id,
        p.brand_id,
        p.unit,
        p.size_id,
        p.size_height,
        p.size_width,
        p.size_length,
        p.colour_id,
        p.group_id,
        p.weight,
        p.weight_unit_id,
        p.materials,
        p.short_desc,
        p.long_desc,
        p.details_overview,
        p.details_specifications,
        p.details_size_and_materials,
        p.details_size_and_materials,
        p.created_at,
        p.updated_at,
        w.name AS warehouse_name,
        c.name AS category_name,
        b.name AS brand_name
      FROM
        products p
      LEFT JOIN
        brands b ON p.brand_id = b.id
      LEFT JOIN
        categories c ON p.category_id = c.id
      LEFT JOIN
        product_warehouse_branch pw ON p.id = pw.product_id
      LEFT JOIN
        warehouses w ON pw.warehouse_id = w.id
      WHERE p.category_id = ? LIMIT ? OFFSET ?`;

    const productResults = await this.entityManager.query(productsQuery, [
      categoryId,
      Number(perPage),
      Number((page - 1) * Number(perPage)),
    ]);

    const total = await this.entityManager.query(
      `SELECT
        COUNT(p.id) AS count
      FROM
        products p
      LEFT JOIN
        brands b ON p.brand_id = b.id
      LEFT JOIN
        categories c ON p.category_id = c.id
      LEFT JOIN
        product_warehouse_branch pw ON p.id = pw.product_id
      LEFT JOIN
        warehouses w ON pw.warehouse_id = w.id
      WHERE p.category_id = ?`,
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

    const productsWithCategoryAndWarehouses = [];
    for (const product of productResults) {
      const { brand_id, ...productData } = product; // Destructure the brand_id property
      const brandQuery = `
            SELECT
                *
            FROM
                brands
            WHERE
                id = ?`;
      const brandResult = await this.entityManager.query(brandQuery, [
        brand_id,
      ]);
      const brandData = brandResult[0]; // Assuming there's only one brand with the given id

      // Fetching warehouse data
      const warehousesQuery = `
            SELECT
                pw.warehouse_id AS id,
                w.name AS name,
                w.abn_number AS abn_number,
                w.active AS active
            FROM
                product_warehouse_branch pw
            INNER JOIN
                warehouses w ON pw.warehouse_id = w.id
            WHERE
                pw.id = ?`;

      const warehouseResults = await this.entityManager.query(warehousesQuery, [
        product.id,
      ]);
      if (warehouseResults.length > 0) {
        // Prepare an array of promises for fetching ratings
        const ratingPromises = warehouseResults.map(async (warehouse) => {
          const given_to_id = warehouse.id;
          const result = await this.entityManager.query(
            'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(rating) as total_ratings FROM overall_reviews WHERE given_to_id = ? AND given_to_type_id=20',
            [given_to_id],
          );

          const averageRating = result[0]?.average_rating || 0;
          const totalRatings = result[0]?.total_ratings || 0;

          return {
            id: given_to_id,
            avg_rating: {
              average_rating: Number(averageRating),
              total_ratings: Number(totalRatings),
            },
          };
        });

        // Wait for all rating queries to complete
        const ratings = await Promise.all(ratingPromises);

        // Merge ratings back into warehouseResults
        ratings.forEach((rating) => {
          const warehouse = warehouseResults.find((w) => w.id === rating.id);
          if (warehouse) {
            warehouse.avg_rating = rating.avg_rating;
          }
        });
      }
      for (const item of warehouseResults) {
        const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

        const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

        const logo = await this.entityManager.query(logo_cloudflare_id_query, [
          item.warehouse_id,
        ]);

        const thumbnail = await this.entityManager.query(
          thumbnail_cloudflare_id_query,
          [item.warehouse_id],
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

        item.logo_url = logo_url;
        item.thumbnail_url = thumbnail_url;
      }

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

      productsWithCategoryAndWarehouses.push({
        ...productData, // Entire product object
        img_urls, //image urls
        brand_name: brandData.name, // Add the brand data as a separate object
        warehouses: warehouseResults,
      });
    }

    return {
      data: {
        category: categoryResult[0],
        products: productsWithCategoryAndWarehouses,
      },
      total: Number(total[0].count),
      current_page: Number(current_page),
      per_page: Number(per_page),
      first_page_url,
      last_page_url,
      next_page_url,
      prev_page_url,
      path,
      from,
      to,
      last_page,
    };
  }
}
