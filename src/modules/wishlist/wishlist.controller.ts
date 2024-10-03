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
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { WishList } from './wishlist.entity';
import { WishListService } from './wishlist.service';

@Controller('wishlist')
@ApiTags('Wishlist')
export class WishListController {
  constructor(private readonly wishListService: WishListService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get wish list of the current customer' })
  async getWishList(): Promise<{
    status: string;
    message: string;
    data: WishList[];
  }> {
    const results = await this.wishListService.getWishList();
    return {
      status: 'success',
      message: 'Wish list fetched successfully',
      data: results,
    };
  }
  @Get('new-list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get wish list of the current customer' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'perPage', type: Number, required: false })
  async getWishNewList(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ): Promise<{
    status: string;
    message: string;
    data: WishList[];
  }> {
    page = page || 1;
    perPage = perPage || 10;
    const results = await this.wishListService.getWishNewList({
      page,
      perPage,
    });
    return {
      status: 'success',
      message: 'Wish list fetched successfully',
      data: results,
    };
  }

  @Post('add-single/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add a product to wish list' })
  async addToWishList(@Param('productId') productId: number): Promise<{
    status: string;
    message: string;
    data: WishList;
  }> {
    const result = await this.wishListService.addToWishList(productId);
    return {
      status: 'success',
      message: 'Product has been added to wish list successfully',
      data: result,
    };
  }

  @Delete('remove-single/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Remove product from wish list' })
  async removeFromWishList(@Param('productId') productId: number): Promise<{
    status: string;
    message: string;
    data: WishList;
  }> {
    const result = await this.wishListService.removeFromWishList(productId);
    return {
      status: 'success',
      message: 'Product has been removed from wish list successfully',
      data: result,
    };
  }

  @Patch(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add/Remove a product from the wish list' })
  async updateWishList(@Param('productId') productId: number): Promise<{
    status: string;
    message: string;
    data: WishList;
  }> {
    return await this.wishListService.updateWishList(productId);
  }

  @Post('add-multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add multiple products to the wish list' })
  @ApiBody({ type: [Number] }) // Define the request body as an array of numbers
  async addMultipleToWishList(
    @Body() productIds: number[],
  ): Promise<{ status: string; message: string; data: WishList[] }> {
    try {
      // Call the service method to add multiple items to the wishlist
      const wishlistItems = await this.wishListService.addMultipleToWishList(
        productIds,
      );
      return {
        status: 'success',
        message: 'Products have been added to wish list successfully',
        data: wishlistItems,
      };
    } catch (error) {
      // Handle errors here if necessary
      throw error;
    }
  }
}
