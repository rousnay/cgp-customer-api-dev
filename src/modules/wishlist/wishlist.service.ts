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

@Injectable()
export class WishListService {
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
        delete wishListItem.product_id; // Remove product_id
        delete wishListItem.customer_id; // Remove customer_id

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
                pw.product_id = ?`;

        const warehouseResults = await this.entityManager.query(
          warehousesQuery,
          [productData[0]?.id],
        );

        wishListWithProductData.push({
          ...wishListItem,

          product: {
            ...productData[0],
            brand_name: brandResult[0]?.name, // Add the brand data as a separate object
            warehouses: warehouseResults,
          }, // Include full product data
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
