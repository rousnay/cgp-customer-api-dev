import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Body,
  Put,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Cart } from './cart.entity';

@Controller('cart')
@ApiTags('Cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get cart of the current customer' })
  async getCart(): Promise<{
    status: string;
    message: string;
    data: Cart[];
  }> {
    const results = await this.cartService.getCart();
    return {
      status: 'success',
      message: 'Cart fetched successfully',
      data: results,
    };
  }

  @Post('add-single/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add a product to cart' })
  async addToCart(@Param('productId') productId: number): Promise<{
    status: string;
    message: string;
    data: Cart;
  }> {
    const result = await this.cartService.addToCart(productId);
    return {
      status: 'success',
      message: 'Product has been added to cart successfully',
      data: result,
    };
  }

  @Delete('remove-single/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Remove product from cart' })
  async removeFromCart(@Param('productId') productId: number): Promise<{
    status: string;
    message: string;
    data: Cart;
  }> {
    const result = await this.cartService.removeFromCart(productId);
    return {
      status: 'success',
      message: 'Product has been removed from cart successfully',
      data: result,
    };
  }

  @Patch(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add/Remove a product from the cart' })
  async updateCart(@Param('productId') productId: number): Promise<{
    status: string;
    message: string;
    data: Cart;
  }> {
    return await this.cartService.updateCart(productId);
  }

  @Post('add-multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add multiple products to the cart' })
  @ApiBody({ type: [Number] })
  async addMultipleToCart(
    @Body() productIds: number[],
  ): Promise<{ status: string; message: string; data: Cart[] }> {
    try {
      // Call the service method to add multiple items to the cart
      const cartItems = await this.cartService.addMultipleToCart(productIds);
      return {
        status: 'success',
        message: 'Products have been added to cart successfully',
        data: cartItems,
      };
    } catch (error) {
      // Handle errors here if necessary
      throw error;
    }
  }
}
