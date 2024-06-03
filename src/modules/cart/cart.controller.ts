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
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CartService } from './cart.service';
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

  @Post('add-single/:productId/:quantity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add a product to cart' })
  async addToCart(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('quantity', ParseIntPipe) quantity: number,
  ): Promise<{
    status: string;
    message: string;
    data: Cart;
  }> {
    const result = await this.cartService.addToCart(productId, quantity);
    return {
      status: 'success',
      message: 'Product has been added to cart successfully',
      data: result,
    };
  }

  @Patch('update-single/:cartId/:quantity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update the quantity of a product in the cart' })
  async updateCart(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Param('quantity', ParseIntPipe) quantity: number,
  ): Promise<{
    status: string;
    message: string;
    data: Cart;
  }> {
    const result = await this.cartService.updateCart(cartId, quantity);
    return {
      status: 'success',
      message: 'Cart has been updated successfully',
      data: result,
    };
  }

  @Delete('remove-single/:cartId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Remove product from cart' })
  async removeFromCart(@Param('cartId', ParseIntPipe) cartId: number): Promise<{
    status: string;
    message: string;
    data: Cart;
  }> {
    const result = await this.cartService.removeFromCart(cartId);
    return {
      status: 'success',
      message: 'Product has been removed from cart successfully',
      data: result,
    };
  }

  @Post('add-multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add multiple products to the cart' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'number' },
          quantity: { type: 'number' },
        },
      },
    },
  })
  async addMultipleToCart(
    @Body() productQuantities: { productId: number; quantity: number }[],
  ): Promise<{ status: string; message: string; data: Cart[] }> {
    try {
      // Call the service method to add multiple items to the cart
      const cartItems = await this.cartService.addMultipleToCart(
        productQuantities,
      );
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

  @Delete('remove-multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Remove multiple products to the cart' })
  @ApiBody({ type: [Number] }) // Define the request body as an array of numbers
  async removeMultipleFromCart(
    @Body() cartIds: number[],
  ): Promise<{ status: string; message: string }> {
    try {
      await this.cartService.removeMultipleFromCart(cartIds);
      return {
        status: 'success',
        message: 'Products have been removed from cart successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('One or more cart items not found');
      }
      throw error;
    }
  }
}
