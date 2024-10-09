import { REQUEST } from '@nestjs/core';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager } from 'typeorm';

import { ProductsService } from '@modules/products/services/products.service';
import { WishList } from './wishlist.entity';
import { AppConstants } from '@common/constants/constants';

@Injectable()
export class WishListService {
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(WishList)
    private readonly wishListRepository: Repository<WishList>,
    private readonly productsService: ProductsService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  // async getWishList(): Promise<WishList[]> {
  //   const customerId = this.request['user'].id;
  //   return this.wishListRepository.find({ where: { customer_id: customerId } });
  // }

  async getWishList(): Promise<any[]> {
    const customerId = this.request['user'].id;
    const wishListItems = await this.wishListRepository.find({
      where: { customer_id: customerId },
    });

    const wishListWithProductData = [];

    for (const wishListItem of wishListItems) {
      const productQuery = `
      SELECT
        *
      FROM
        products
      WHERE
        id = ?`;

      const productData = await this.entityManager.query(productQuery, [
        wishListItem.product_id,
      ]);

      if (productData) {
        // Fetching brands data
        const brandQuery = `
            SELECT
                b.name
            FROM
                brands b
            WHERE
                id = ?`;
        const brandResult = await this.entityManager.query(brandQuery, [
          productData[0]?.brand_id,
        ]);

        // product warehouse branch
        const productWarehouseBranchQuery = `
        SELECT
            *
        FROM
            product_warehouse_branch
        WHERE
            product_id = ?`;
        const productWarehouseBranchData = await this.entityManager.query(
          productWarehouseBranchQuery,
          [productData[0]?.id],
        );

        // Fetching warehouse branch data
        const _productWarehouseBranchData = [];
        for (const item of productWarehouseBranchData) {
          // find branch
          const branchQuery = `
              SELECT
                  wb.*, w.id AS warehouse_id, w.name AS warehouse_name, w.abn_number AS warehouse_abn_number, 
                  w.active AS warehouse_active
              FROM
                  warehouse_branches wb
              LEFT JOIN
                  warehouses w ON wb.warehouse_id = w.id
              WHERE
                  wb.id = ?`;
          const branchResult = await this.entityManager.query(branchQuery, [
            item?.warehouse_branch_id,
          ]);
          const branchData = branchResult; // Assuming there's only one branch with the given id
          // Fetching the warehouse logo and thumbnail using the warehouse ID from branchData
          const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
              FROM cf_media cf
              WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

          const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
              FROM cf_media cf
              WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

          const logo = await this.entityManager.query(
            logo_cloudflare_id_query,
            [branchData.warehouse_id],
          );

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

          _productWarehouseBranchData.push({
            id: branchData[0]?.warehouse_id,
            name: branchData[0]?.warehouse_name,
            abn_number: branchData[0]?.warehouse_abn_number,
            active: branchData[0]?.warehouse_active,
            logo_url: logo_url,
            thumbnail_url: thumbnail_url,
            avg_rating: warehouse_avg_rating,
            branchInfo: {
              id: branchData[0]?.id,
              name: branchData[0]?.name,
              branch_type: branchData[0]?.branch_type,
              active: branchData[0]?.active,
              created_at: '2024-04-08T04:00:00.000Z',
              updated_at: '2024-05-16T05:54:22.000Z',
            },
          });
        }
        const product_cloudflare_id_query = `SELECT cf.cloudflare_id FROM cf_media cf WHERE cf.model = 'App\\\\Models\\\\Product' AND cf.model_id = ?`;

        const product_cloudflare_id_result = await this.entityManager.query(
          product_cloudflare_id_query,
          [wishListItem.product_id],
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
        delete wishListItem.product_id; // Remove product_id
        delete wishListItem.customer_id; // Remove customer_id

        wishListWithProductData.push({
          ...wishListItem,
          product: {
            id: productData[0]?.id,
            name: productData[0]?.name,
            regular_price: productData[0]?.regular_price,
            sales_price: productData[0]?.sales_price,
            active: productData[0]?.active,
            has_own_product_img: productData[0]?.has_own_product_img,
            unit: productData[0]?.unit,
            size_id: productData[0]?.size_id,
            size_height: productData[0]?.size_height,
            size_width: productData[0]?.size_width,
            color_id: productData[0]?.color_id,
            weight: productData[0]?.weight,
            weight_unit_id: productData[0]?.weight_unit_id,
            materials: productData[0]?.materials,
            short_desc: productData[0]?.short_desc,
            category_name: productData[0]?.category_name,
            created_at: productData[0]?.created_at,
            updated_at: productData[0]?.updated_at,
            brand_name: brandResult[0]?.name, // Add the brand data as a separate object
            img_urls,
            warehouses: _productWarehouseBranchData,
          }, // Include full product data
        });
      }
    }

    return wishListWithProductData;
  }

  async getWishNewList({
    page,
    perPage,
  }: {
    page: number;
    perPage: number;
  }): Promise<any[]> {
    page = Number(page);
    perPage = Number(perPage);

    const customerId = this.request['user'].id;
    const wishListItems = await this.wishListRepository.find({
      where: { customer_id: customerId },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    const total = await this.wishListRepository.count({
      where: { customer_id: customerId },
    });

    const wishListWithProductData = [];

    for (const wishListItem of wishListItems) {
      const productQuery = `
      SELECT
        *
      FROM
        products
      WHERE
        id = ?`;

      const productData = await this.entityManager.query(productQuery, [
        wishListItem.product_id,
      ]);

      if (productData) {
        // Fetching brands data
        const brandQuery = `
            SELECT
                b.name
            FROM
                brands b
            WHERE
                id = ?`;
        const brandResult = await this.entityManager.query(brandQuery, [
          productData[0]?.brand_id,
        ]);

        // product warehouse branch
        const productWarehouseBranchQuery = `
        SELECT
            *
        FROM
            product_warehouse_branch
        WHERE
            product_id = ?`;
        const productWarehouseBranchData = await this.entityManager.query(
          productWarehouseBranchQuery,
          [productData[0]?.id],
        );

        // Fetching warehouse branch data
        const _productWarehouseBranchData = [];
        for (const item of productWarehouseBranchData) {
          // find branch
          const branchQuery = `
              SELECT
                  wb.*, w.id AS warehouse_id, w.name AS warehouse_name, w.abn_number AS warehouse_abn_number, 
                  w.active AS warehouse_active
              FROM
                  warehouse_branches wb
              LEFT JOIN
                  warehouses w ON wb.warehouse_id = w.id
              WHERE
                  wb.id = ?`;
          const branchResult = await this.entityManager.query(branchQuery, [
            item?.warehouse_branch_id,
          ]);
          const branchData = branchResult; // Assuming there's only one branch with the given id
          // Fetching the warehouse logo and thumbnail using the warehouse ID from branchData
          const logo_cloudflare_id_query = `SELECT cf.cloudflare_id
              FROM cf_media cf
              WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'logo' AND cf.model_id = ?`;

          const thumbnail_cloudflare_id_query = `SELECT cf.cloudflare_id
              FROM cf_media cf
              WHERE cf.model = 'App\\\\Models\\\\Warehouse' AND cf.image_type = 'thumbnail' AND cf.model_id = ?`;

          const logo = await this.entityManager.query(
            logo_cloudflare_id_query,
            [branchData.warehouse_id],
          );

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

          _productWarehouseBranchData.push({
            id: branchData[0]?.warehouse_id,
            name: branchData[0]?.warehouse_name,
            abn_number: branchData[0]?.warehouse_abn_number,
            active: branchData[0]?.warehouse_active,
            logo_url: logo_url,
            thumbnail_url: thumbnail_url,
            avg_rating: warehouse_avg_rating,
            branchInfo: {
              id: branchData[0]?.id,
              name: branchData[0]?.name,
              branch_type: branchData[0]?.branch_type,
              active: branchData[0]?.active,
              created_at: '2024-04-08T04:00:00.000Z',
              updated_at: '2024-05-16T05:54:22.000Z',
            },
          });
        }
        const product_cloudflare_id_query = `SELECT cf.cloudflare_id FROM cf_media cf WHERE cf.model = 'App\\\\Models\\\\Product' AND cf.model_id = ?`;

        const product_cloudflare_id_result = await this.entityManager.query(
          product_cloudflare_id_query,
          [wishListItem.product_id],
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
        delete wishListItem.product_id; // Remove product_id
        delete wishListItem.customer_id; // Remove customer_id

        const per_page = Number(perPage);
        const current_page = Number(page);
        const last_page = Number(Math.ceil(Number(total) / per_page));
        const first_page_url = '';
        const last_page_url = '';
        const next_page_url = '';
        const prev_page_url = '';
        const path = '';
        const from = Number((page - 1) * perPage + 1);
        const to = Number(page * perPage);

        wishListWithProductData.push({
          ...wishListItem,
          product: {
            id: productData[0]?.id,
            name: productData[0]?.name,
            regular_price: productData[0]?.regular_price,
            sales_price: productData[0]?.sales_price,
            active: productData[0]?.active,
            has_own_product_img: productData[0]?.has_own_product_img,
            unit: productData[0]?.unit,
            size_id: productData[0]?.size_id,
            size_height: productData[0]?.size_height,
            size_width: productData[0]?.size_width,
            color_id: productData[0]?.color_id,
            weight: productData[0]?.weight,
            weight_unit_id: productData[0]?.weight_unit_id,
            materials: productData[0]?.materials,
            short_desc: productData[0]?.short_desc,
            category_name: productData[0]?.category_name,
            created_at: productData[0]?.created_at,
            updated_at: productData[0]?.updated_at,
            brand_name: brandResult[0]?.name, // Add the brand data as a separate object
            img_urls,
            warehouses: _productWarehouseBranchData,
          }, // Include full product data
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
        });
      }
    }

    return wishListWithProductData;
  }

  async addToWishList(productId: number): Promise<WishList> {
    const customerId = this.request['user'].id;
    const existingWishListItem = await this.wishListRepository.findOne({
      where: {
        customer_id: customerId,
        product_id: productId,
      },
    });

    if (existingWishListItem) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Product already exists in the wish list',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newWishListItem = this.wishListRepository.create({
      customer_id: customerId,
      product_id: productId,
    });
    return this.wishListRepository.save(newWishListItem);
  }

  async removeFromWishList(productId: number): Promise<any> {
    const customerId = this.request['user'].id;
    const wishListItem = await this.wishListRepository.findOne({
      where: {
        customer_id: customerId,
        product_id: productId,
      },
    });

    if (!wishListItem) {
      throw new NotFoundException('Wish list item not found');
    }

    await this.wishListRepository.remove(wishListItem);
  }

  async updateWishList(productId: number): Promise<any> {
    const customerId = this.request['user'].id;
    let wishListItem = await this.wishListRepository.findOne({
      where: {
        customer_id: customerId,
        product_id: productId,
      },
    });

    if (wishListItem) {
      // If the item already exists, remove it
      await this.wishListRepository.remove(wishListItem);
      return {
        status: 'success',
        message: 'Wish list item removed successfully',
      }; // Exit early after removing the item
    } else {
      // If the item doesn't exist, add it
      wishListItem = this.wishListRepository.create({
        customer_id: customerId,
        product_id: productId,
      });
      return {
        status: 'success',
        message: 'Wish list item added successfully',
        data: await this.wishListRepository.save(wishListItem),
      };
    }
  }

  async addMultipleToWishList(productIds: number[]): Promise<WishList[]> {
    const customerId = this.request['user'].id;

    // Find existing wishlist items for the customer and the given product ids
    const existingWishListItems = await this.wishListRepository.find({
      where: { customer_id: customerId, product_id: In(productIds) },
    });

    // Filter out the product ids for which wishlist items already exist
    const newProductIds = productIds.filter(
      (productId) =>
        !existingWishListItems.some((item) => item.product_id === productId),
    );

    // Create wishlist items for the new product ids
    const newWishListItems = newProductIds.map((productId) =>
      this.wishListRepository.create({
        customer_id: customerId,
        product_id: productId,
      }),
    );

    // Save the new wishlist items
    const savedNewWishListItems = await this.wishListRepository.save(
      newWishListItems,
    );

    // Return the newly added wishlist items along with any existing items
    return [...existingWishListItems, ...savedNewWishListItems];
  }
}
