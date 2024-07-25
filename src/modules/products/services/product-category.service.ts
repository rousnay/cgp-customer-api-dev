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
                w.name AS warehouse_name
            FROM
                product_warehouse_branch pw
            INNER JOIN
                warehouses w ON pw.warehouse_id = w.id
            WHERE
                pw.id = ?`;

      const warehouseResults = await this.entityManager.query(warehousesQuery, [
        product.id,
      ]);


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

        item.logo_url = logo_url
        item.thumbnail_url = thumbnail_url

      }

      const product_cloudflare_id_query = `SELECT cf.cloudflare_id FROM cf_media cf WHERE cf.model = 'App\\\\Models\\\\Product' AND cf.model_id = ?`;

      const product_cloudflare_id_result = await this.entityManager.query(product_cloudflare_id_query, [product.id]);

      const img_urls = [];

      product_cloudflare_id_result.map(item => {
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

      })

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
}
