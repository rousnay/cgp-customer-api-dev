import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WishList } from './wishlist.entity';
import { REQUEST } from '@nestjs/core';
import { ProductsService } from 'src/products/services/products.service';

@Injectable()
export class WishListService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(WishList)
    private readonly wishListRepository: Repository<WishList>,
    private readonly productsService: ProductsService,
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
      const productData = await this.productsService.findOne(
        wishListItem.product_id,
      );
      if (productData) {
        delete wishListItem.product_id; // Remove product_id
        delete wishListItem.customer_id; // Remove customer_id
        wishListWithProductData.push({
          ...wishListItem,
          product: productData.data, // Include full product data
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
      throw new Error('Product already exists in the wish list');
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
