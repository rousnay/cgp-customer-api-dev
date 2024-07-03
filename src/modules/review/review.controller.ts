import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update a review' })
  @ApiResponse({
    status: 201,
    description: 'The review has been successfully posted.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'number' },
        given_to: {
          type: 'string',
          default: 'rider or warehouse',
          enum: ['rider', 'warehouse'],
        },
        given_to_id: { type: 'number' },
        rating: { type: 'number', minimum: 0, maximum: 5 },
        review: { type: 'string' },
      },
      required: ['orderId', 'given_to', 'given_to_id', 'rating', 'review'],
    },
  })
  async createOrUpdateReview(
    @Body('orderId') orderId: number,
    @Body('given_to') given_to: string,
    @Body('given_to_id') given_to_id: number,
    @Body('rating') rating: number,
    @Body('review') review: string,
  ): Promise<any> {
    const model = 'App\\Models\\Order';
    const model_id = orderId;

    let given_to_type_id = null;
    if (given_to === 'rider') {
      given_to_type_id = 19;
    } else if (given_to === 'warehouse') {
      given_to_type_id = 20;
    }

    const theReview = await this.reviewService.createOrUpdateReview(
      model,
      model_id,
      given_to_id,
      given_to_type_id,
      rating,
      review,
    );
    return {
      status: 'success',
      message: 'The review has been successfully posted',
      data: theReview,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async removeReviewById(@Param('id') id: number): Promise<any> {
    await this.reviewService.removeReviewById(id);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async getAllReviews(): Promise<any> {
    const reviews = await this.reviewService.getAllReviews();

    return {
      status: 'success',
      message: 'All reviews has been successfully fetched',
      data: reviews,
    };
  }

  @Get('average-rating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async getAverageRating(@Request() req): Promise<any> {
    const customerId = req.user.id;
    const avgRating = await this.reviewService.getAverageRating(customerId);
    return {
      status: 'success',
      message: 'All reviews has been successfully fetched',
      data: avgRating,
    };
  }
}
