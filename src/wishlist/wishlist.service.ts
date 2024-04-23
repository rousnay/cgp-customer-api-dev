import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WishList } from './wishlist.entity';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class WishListService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(WishList)
    private readonly wishListRepository: Repository<WishList>,
  ) {}

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

  async getWishList(): Promise<WishList[]> {
    const customerId = this.request['user'].id;
    return this.wishListRepository.find({ where: { customer_id: customerId } });
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

  // async addMultipleToWishList(productIds: number[]): Promise<WishList[]> {
  //   const customerId = this.request['user'].id;
  //   const existingWishListItems = await this.wishListRepository.find({
  //     where: { customer_id: customerId, product_id: In(productIds) },
  //   });

  //   if (existingWishListItems.length > 0) {
  //     throw new Error('Some products already exist in the wish list');
  //   }

  //   const newWishListItems = productIds.map((productId) =>
  //     this.wishListRepository.create({
  //       customer_id: customerId,
  //       product_id: productId,
  //     }),
  //   );
  //   return this.wishListRepository.save(newWishListItems);
  // }
}
