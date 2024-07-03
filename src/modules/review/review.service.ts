import { REQUEST } from '@nestjs/core';
import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async createOrUpdateReview(
    model: string,
    model_id: number,
    given_to_id: number,
    given_to_type_id: number,
    rating: number,
    review: string,
  ): Promise<any> {
    const customerId = this.request['user']?.id;
    const given_by_id = customerId;
    const given_by_type_id = 18;

    const existingReview = await this.entityManager.query(
      'SELECT * FROM overall_reviews WHERE model = ? AND model_id = ? AND given_by_id = ? AND given_by_type_id = ? AND given_to_id = ? AND given_to_type_id = ?',
      [
        model,
        model_id,
        given_by_id,
        given_by_type_id,
        given_to_id,
        given_to_type_id,
      ],
    );

    if (existingReview.length > 0) {
      // Update the existing review
      await this.entityManager.query(
        'UPDATE overall_reviews SET rating = ?, review = ?, updated_at = NOW() WHERE model = ? AND model_id = ? AND given_by_id = ? AND given_by_type_id = ? AND given_to_id = ? AND given_to_type_id = ?',
        [
          rating,
          review,
          model,
          model_id,
          given_by_id,
          given_by_type_id,
          given_to_id,
          given_to_type_id,
        ],
      );
      // Return updated review details
      return {
        id: Number(existingReview[0].id),
        rating: rating,
        review: review,
        created_at: existingReview[0].created_at,
        updated_at: new Date(),
      };
    } else {
      // Insert a new review
      await this.entityManager.query(
        'INSERT INTO overall_reviews (model, model_id, given_by_id, given_by_type_id, given_to_id, given_to_type_id, rating, review, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [
          model,
          model_id,
          given_by_id,
          given_by_type_id,
          given_to_id,
          given_to_type_id,
          rating,
          review,
        ],
      );
      // Retrieve the inserted review details
      const insertedReview = await this.entityManager.query(
        'SELECT id, created_at, updated_at, review, rating FROM overall_reviews WHERE model = ? AND model_id = ? AND given_by_id = ? AND given_by_type_id = ? AND given_to_id = ? AND given_to_type_id = ?',
        [
          model,
          model_id,
          given_by_id,
          given_by_type_id,
          given_to_id,
          given_to_type_id,
        ],
      );

      if (insertedReview.length > 0) {
        return {
          id: Number(insertedReview[0].id),
          rating: insertedReview[0].rating,
          review: insertedReview[0].review,
          created_at: insertedReview[0].created_at,
          updated_at: insertedReview[0].updated_at,
        };
      } else {
        throw new Error('Failed to fetch newly inserted review details.');
      }
    }
  }

  async removeReviewById(id: number): Promise<void> {
    const customerId = this.request['user']?.id;
    const given_by_id = customerId;
    const given_by_type_id = 18;

    await this.entityManager.query(
      'DELETE FROM overall_reviews WHERE id = ? AND given_by_id = ? AND given_by_type_id = ?',
      [id, given_by_id, given_by_type_id],
    );
  }

  async getAllReviews(): Promise<any[]> {
    const customerId = this.request['user']?.id;
    const reviews = await this.entityManager.query(
      'SELECT * FROM overall_reviews WHERE given_by_id = ?',
      [customerId],
    );
    return reviews;
  }

  async getAverageRating(customerId: number): Promise<{
    average_rating: number;
    total_ratings: number;
  }> {
    const given_to_id = customerId;
    const result = await this.entityManager.query(
      'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(rating) as total_ratings FROM overall_reviews WHERE given_to_id = ?',
      [given_to_id],
    );

    const averageRating = result[0].average_rating || 0;
    const totalRatings = result[0].total_ratings || 0;

    return {
      average_rating: Number(averageRating),
      total_ratings: Number(totalRatings),
    };
  }
}
