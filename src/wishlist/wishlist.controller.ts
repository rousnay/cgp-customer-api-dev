import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WishListService } from './wishlist.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { WishList } from './wishlist.entity';

@Controller('wishlist')
@ApiTags('Wishlist')
export class WishListController {
  constructor(private readonly wishListService: WishListService) {}

  @Post(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add product to wish list' })
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

  @Delete(':productId')
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

  // @Post('add-multiple')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access_token')
  // async addMultipleToWishList(@Body() productIds: number[]): Promise<any> {
  //   try {
  //     const addedItems = await this.wishListService.addMultipleToWishList(
  //       productIds,
  //     );
  //     return {
  //       success: true,
  //       message: 'Products added to wish list successfully',
  //       data: addedItems,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message || 'Failed to add products to wish list',
  //     };
  //   }
  // }
}
