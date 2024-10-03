import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager } from 'typeorm';
import { REQUEST } from '@nestjs/core';

import { ProductsService } from '@modules/products/services/products.service';
import { Cart } from './cart.entity';

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

  async getCart(): Promise<any[]> {
    const customerId = this.request['user'].id;
    const cartItems = await this.cartRepository.find({
      where: { customer_id: customerId },
    });

    const cartWithProductData = [];

    for (const cartItem of cartItems) {
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
                pw.id = ?`;

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
  async getNewCart(): Promise<any[]> {
    const customerId = this.request['user'].id;
    const cartItems = await this.cartRepository.find({
      where: { customer_id: customerId },
    });

    const cartWithProductData = [];
    for (const cartItem of cartItems) {
      console.log(cartItem);
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

      const productData = await this.entityManager.query(productQuery, [
        cartItem.product_id,
      ]);
      console.log(cartItem.product_id, productData);
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
                pw.id = ?`;

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

  async addToCart(productId: number, quantity: number): Promise<Cart> {
    const customerId = this.request['user'].id;
    const existingCartItem = await this.cartRepository.findOne({
      where: {
        customer_id: customerId,
        product_id: productId,
      },
    });

    if (existingCartItem) {
      // If the product already exists, update its quantity
      existingCartItem.quantity = quantity;
      await this.cartRepository.save(existingCartItem);
      return existingCartItem;
    }

    // If the product doesn't exist, create a new cart item
    const newCartItem = this.cartRepository.create({
      customer_id: customerId,
      product_id: productId,
      quantity: quantity,
    });
    return this.cartRepository.save(newCartItem);
  }

  async updateCart(cartId: number, quantity: number): Promise<Cart> {
    const customerId = this.request['user'].id;
    const existingCartItem = await this.cartRepository.findOne({
      where: {
        id: cartId,
        customer_id: customerId,
      },
    });

    // If the cart item doesn't exist, throw a NotFoundException
    if (!existingCartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // If the cart already exists, update its quantity
    existingCartItem.quantity = quantity;
    await this.cartRepository.save(existingCartItem);
    return existingCartItem;
  }

  async removeFromCart(cartId: number): Promise<any> {
    const customerId = this.request['user'].id;

    // Find the cart item by id and product_id
    const cartItem = await this.cartRepository.findOne({
      where: {
        id: cartId,
        customer_id: customerId,
      },
    });

    // If the cart item doesn't exist, throw a NotFoundException
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Remove the cart item
    await this.cartRepository.remove(cartItem);
  }

  async addMultipleToCart(
    productQuantities: { productId: number; quantity: number }[],
  ): Promise<Cart[]> {
    const customerId = this.request['user'].id;

    // Find existing cart items for the customer and the given product ids
    const existingCartItems = await this.cartRepository.find({
      where: {
        customer_id: customerId,
        product_id: In(productQuantities.map((item) => item.productId)),
      },
    });

    // Update quantities for existing cart items
    existingCartItems.forEach((existingCartItem) => {
      const matchedProductQuantity = productQuantities.find(
        (item) => item.productId === existingCartItem.product_id,
      );
      if (matchedProductQuantity) {
        existingCartItem.quantity = matchedProductQuantity.quantity;
      }
    });

    // Create new cart items for products that don't exist in the cart
    const newCartItems = productQuantities
      .filter(
        (item) =>
          !existingCartItems.some(
            (cartItem) => cartItem.product_id === item.productId,
          ),
      )
      .map((item) =>
        this.cartRepository.create({
          customer_id: customerId,
          product_id: item.productId,
          quantity: item.quantity,
        }),
      );

    // Save both updated existing cart items and newly created cart items
    const savedExistingCartItems = await this.cartRepository.save(
      existingCartItems,
    );
    const savedNewCartItems = await this.cartRepository.save(newCartItems);

    // Return the updated existing cart items along with the newly created cart items
    return [...savedExistingCartItems, ...savedNewCartItems];
  }

  async removeMultipleFromCart(cartIds: number[]): Promise<void> {
    const customerId = this.request['user'].id;

    // Find the cart items by ids and customer_id
    const cartItems = await this.cartRepository.find({
      where: {
        id: In(cartIds),
        customer_id: customerId,
      },
    });

    // If any of the cart items don't exist, remove the existing ones and throw a NotFoundException
    if (cartItems.length === 0) {
      throw new NotFoundException('One or more cart items not found');
    }

    // Remove the cart items
    await this.cartRepository.remove(cartItems);
  }
}
