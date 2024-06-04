import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';

import { ConfigService } from '@config/config.service';
import { AppConstants } from '@common/constants/constants';

@Injectable()
export class CloudflareMediaService {
  private readonly cfAccId: string;
  private readonly cfApiToken: string;
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  private readonly cfApiBaseUrl = AppConstants.cloudflare.apiBaseUrl;
  constructor(
    private readonly entityManager: EntityManager,
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.cfAccId = configService.cloudflareAccountId;
    this.cfApiToken = configService.cloudflareApiToken;
    this.cfAccountHash = configService.cloudflareAccountHash;
  }

  async uploadMedia(file: Express.Multer.File, args: any): Promise<any> {
    const imageTypes = ['regular', 'cover', 'thumbnail'];
    const imageType =
      args.image_type && imageTypes.includes(args.image_type)
        ? args.image_type
        : 'regular';

    const attributes = {
      model: args.model,
      model_id: args.model_id,
      image_type: imageType,
      ...args,
    };

    const filename = Date.now() + '-' + file.originalname.split('.').pop();

    const postUrl = `${this.cfApiBaseUrl}/${this.cfAccId}/images/v1`;
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    try {
      const response = await firstValueFrom(
        this.httpService.post(postUrl, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.cfApiToken}`,
          },
        }),
      );

      if (response.status === 200) {
        const cf_id = await response?.data?.result?.id;
        const insertResult = await this.entityManager
          .createQueryBuilder()
          .insert()
          .into('cf_media')
          .values({
            ...attributes,
            original_name: file.originalname,
            extension: file.originalname.split('.').pop(),
            type: file.mimetype,
            size: file.size,
            cloudflare_id: cf_id,
            file: filename,
          })
          .execute();

        const insertedId = await insertResult?.raw?.insertId;

        const cfMedia = await this.entityManager
          .createQueryBuilder()
          .select(['cf.*'])
          .from('cf_media', 'cf')
          .where('cf.id = :id', { id: insertedId })
          .getRawOne();

        const media_url =
          this.cfMediaBaseUrl +
          '/' +
          this.cfAccountHash +
          '/' +
          cf_id +
          '/' +
          this.cfMediaVariant;

        return {
          message: 'Media has been uploaded successfully',
          data: {
            ...cfMedia,
            media_url,
          },
        };
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
}
