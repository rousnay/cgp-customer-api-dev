import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

@Controller('deliveries')
@ApiTags('Deliveries')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Post('send-delivery-request')
  //   @ApiOperation({ summary: 'PLEASE IGNORE! Only for backend (token)' })
  //   @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stripe_id: {
          type: 'string',
          example:
            'cs_test_a1Z06qkMpx0T5iRkR8KxmYrFwrzeZ5OjeNRCDjRXveYW6IoTAUAit95LYq',
        },
      },
    },
  })
  async sendDeliveryRequest(
    @Body('stripe_id') stripe_id: string,
  ): Promise<any> {
    return await this.deliveryService.sendDeliveryRequest(stripe_id);
  }
}
