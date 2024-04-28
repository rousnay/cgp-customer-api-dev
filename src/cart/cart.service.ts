import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager } from 'typeorm';
import { Cart } from './cart.entity';
import { REQUEST } from '@nestjs/core';
import { ProductsService } from 'src/products/services/products.service';

@Injectable()
export class CartService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly productsService: ProductsService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  // async getCart(): Promise<Cart[]> {
  //   const customerId = this.request['user'].id;
  //   return this.cartRepository.find({ where: { customer_id: customerId } });
  // }

  async getCart(): Promise<any[]> {
    const customerId = this.request['user'].id;
    const cartItems = await this.cartRepository.find({
      where: { customer_id: customerId },
    });

    const cartWithProductData = [];

    for (const cartItem of cartItems) {
      const productQuery = `
      SELECT
        *
      FROM
        products
      WHERE
        id = ?`;

      const productData = await this.entityManager.query(productQuery, [
        cartItem.product_id,
      ]);

      if (productData) {
        delete cartItem.product_id; // Remove product_id
        delete cartItem.customer_id; // Remove customer_id

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

        cartWithProductData.push({
          ...cartItem,

          product: {
            ...productData[0],
            brand_name: brandResult[0]?.name, // Add the brand data as a separate object
            warehouses: warehouseResults,
          }, // Include full product data
        });
      }
    }

    return cartWithProductData;
  }

  async addToCart(productId: number): Promise<Cart> {
    const customerId = this.request['user'].id;
    const existingCartItem = await this.cartRepository.findOne({
      where: {
        customer_id: customerId,
        product_id: productId,
      },
    });

    if (existingCartItem) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Product already exists in the cart',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newCartItem = this.cartRepository.create({
      customer_id: customerId,
      product_id: productId,
    });
    return this.cartRepository.save(newCartItem);
  }

  async removeFromCart(productId: number): Promise<any> {
    const customerId = this.request['user'].id;
    const cartItem = await this.cartRepository.findOne({
      where: {
        customer_id: customerId,
        product_id: productId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart list item not found');
    }

    await this.cartRepository.remove(cartItem);
  }

  async updateCart(productId: number): Promise<any> {
    const customerId = this.request['user'].id;
    let cartItem = await this.cartRepository.findOne({
      where: {
        customer_id: customerId,
        product_id: productId,
      },
    });

    if (cartItem) {
      // If the item already exists, remove it
      await this.cartRepository.remove(cartItem);
      return {
        status: 'success',
        message: 'Product removed from the cart successfully',
      }; // Exit early after removing the item
    } else {
      // If the item doesn't exist, add it
      cartItem = this.cartRepository.create({
        customer_id: customerId,
        product_id: productId,
      });
      return {
        status: 'success',
        message: 'Product added to the cart successfully',
        data: await this.cartRepository.save(cartItem),
      };
    }
  }

  async addMultipleToCart(productIds: number[]): Promise<Cart[]> {
    const customerId = this.request['user'].id;

    // Find existing cart items for the customer and the given product ids
    const existingCartItems = await this.cartRepository.find({
      where: { customer_id: customerId, product_id: In(productIds) },
    });

    // Filter out the product ids for which cart items already exist
    const newProductIds = productIds.filter(
      (productId) =>
        !existingCartItems.some((item) => item.product_id === productId),
    );

    // Create cart items for the new product ids
    const newCartItems = newProductIds.map((productId) =>
      this.cartRepository.create({
        customer_id: customerId,
        product_id: productId,
      }),
    );

    // Save the new cart items
    const savedNewCartItems = await this.cartRepository.save(newCartItems);

    // Return the newly added cart items along with any existing items
    return [...existingCartItems, ...savedNewCartItems];
  }
}
