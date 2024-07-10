// product.service.ts
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AppConstants } from '@common/constants/constants';
import { ProductsDto } from '../dtos/products.dto';
import { ConfigService } from '@config/config.service';

@Injectable()
export class ProductsService {
    private readonly cfAccountHash: string;
    private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
    private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  findProductsByCategoryId(categoryId: number) {
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
      warehouses w ON pw.warehouse_id = w.id`;

    const productResults = await this.entityManager.query(productsQuery);

    // Group the results by product ID
    const productsGroupedById: { [key: number]: any } = {};
    for (const product of productResults) {
      const productId = product.id;
      if (!productsGroupedById[productId]) {
        productsGroupedById[productId] = {
          ...product,
          warehouses: [],
        };
      }

        const product_cloudflare_id_query = `SELECT cf.cloudflare_id
        FROM cf_media cf
        WHERE cf.model = 'App\\\\Models\\\\Product' AND cf.model_id = ?`;

        const product_cloudflare_id_result = await this.entityManager.query(product_cloudflare_id_query, [productId]);


        console.log('product_cloudflare_id_result', product_cloudflare_id_result, productId);
        
        let product_img_url = [];

        product_cloudflare_id_result.map(item => {
            if (item && item.cloudflare_id != null) {
                let url =
                    this.cfMediaBaseUrl +
                    '/' +
                    this.cfAccountHash +
                    '/' +
                    item.cloudflare_id +
                    '/' +
                    this.cfMediaVariant;
                product_img_url.push(url);
            }

        })

        productsGroupedById[productId].img_urls = product_img_url;
    

      // Exclude id, product_name, etc. from product data
      delete product.id;
      delete product.product_name;
      delete product.regular_price;
      delete product.sales_price;
      delete product.quantity;
      delete product.active;
      delete product.has_own_product_img;
      delete product.brand_name;
      delete product.category_name;
      // Add warehouse data to the respective product
      productsGroupedById[productId].warehouses.push({
        id: product.id,
        warehouse_name: product.warehouse_name,
      });
    }

    // Transform grouped products back into an array
    const productsWithBrandData = Object.values(productsGroupedById);

    return {
      data: productsWithBrandData,
    };
  }

  async findOne(id: number): Promise<any | undefined> {
    const productQuery = `
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
        product_warehouse_branch pw
      LEFT JOIN
        products p ON pw.product_id = p.id
      LEFT JOIN
        brands b ON p.brand_id = b.id
      LEFT JOIN
        categories c ON p.category_id = c.id
      LEFT JOIN
        warehouses w ON pw.warehouse_id = w.id
      WHERE
        pw.id = ?`;

    const productResult = await this.entityManager.query(productQuery, [id]);
    if (productResult.length === 0) {
      return undefined; // Return undefined if no product is found
    }

    const productData = productResult[0];
    const brandId = productData.brand_id;

    // Fetch brand data based on brandId
    const brandQuery = `
      SELECT
        *
      FROM
        brands
      WHERE
        id = ?`;

    const brandResult = await this.entityManager.query(brandQuery, [brandId]);
    const brandData = brandResult.length > 0 ? brandResult[0] : {};

    // Fetching warehouse data
    const warehousesQuery = `
            SELECT
                *
            FROM
                product_warehouse_branch pw
            INNER JOIN
                warehouses w ON pw.warehouse_id = w.id
            WHERE
                pw.id = ?`;

    const warehousesResults = await this.entityManager.query(warehousesQuery, [
      id,
    ]);

    const warehousesWithDetails = [];
    for (const warehouse of warehousesResults) {
      const branchesQuery = `SELECT * FROM warehouse_branches WHERE warehouse_id = ?`;
      const branchesResults = await this.entityManager.query(branchesQuery, [
        warehouse.id,
      ]);
      const mainBranch =
        branchesResults.find(
          (branch) => branch.branch_type === 'head office',
        ) || {};

      warehousesWithDetails.push({
        ...warehouse,
        main_branch: mainBranch,
      });
    }

    // Return product data with brand data as a separate object
    return {
      data: {
        ...productData,
        brand: brandData,
        warehouses: warehousesWithDetails,
      },
    };
  }
}
