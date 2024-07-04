import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodService } from '../services/payment-method.service';
import { Response } from 'express';
import { AddPaymentMethodDto } from '../dtos/add-payment-method.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { SetDefaultPaymentMethodDto } from '../dtos/set-default-payment-method.dto';

@Controller('payment-method')
@ApiTags('Payment Method')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access_token')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}
  //! add payment method
  @Post('')
  @ApiOperation({
    summary: 'Add a new payment method and attach it to customer',
  })
  @ApiBody({ type: AddPaymentMethodDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pmID: {
          type: 'string',
          example: 'pm_1PYo08Hypixj3Ac96ooIWK6j',
        },
        isDefault: { type: 'boolean', example: true },
      },
    },
  })
  async addPaymentMethod(
    @Res() res: Response,
    @Body() body: AddPaymentMethodDto,
  ) {
    const { pmID, isDefault } = body;
    const result = await this.paymentMethodService.addPaymentMethod({
      pmID,
      isDefault,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Payment method added successfully',
      data: result,
    });
  }
  //! set default payment method
  @Put('set-default/:pmID')
  @ApiOperation({
    summary: 'Set default payment method for customer',
  })
  @ApiParam({
    name: 'pmID',
    description: 'The Payment Method ID for to be set as default',
  })
  async setDefaultPaymentMethod(
    @Res() res: Response,
    @Param()
    param: SetDefaultPaymentMethodDto,
  ) {
    const { pmID } = param;
    const result = await this.paymentMethodService.setDefaultPaymentMethod(
      pmID,
    );
    return res.status(200).json({
      status: 'success',
      message: result
        ? 'Default payment method set successfully'
        : 'Failed to set default payment method',
      data: result,
    });
  }
  //! get all payment method by user
  @Get('get-all-by-user')
  @ApiOperation({
    summary: 'Get all payment methods by user',
  })
  async getAllPaymentMethodByUser(@Res() res: Response) {
    const result = await this.paymentMethodService.getAllPaymentMethodByUser();
    return res.status(200).json({
      status: 'success',
      message: 'Payment methods retrieved successfully',
      data: result,
    });
  }
  //! delete payment method
  @Delete(':pmID')
  @ApiOperation({
    summary: 'Delete payment method',
  })
  @ApiParam({
    name: 'pmID',
    description: 'The Payment Method ID for to be deleted',
  })
  async deletePaymentMethod(@Res() res: Response, @Param('pmID') pmID: string) {
    const result = await this.paymentMethodService.deletePaymentMethod(pmID);
    return res.json({
      status: 'success',
      message: 'Payment method deleted successfully',
      data: result,
    });
  }
}
