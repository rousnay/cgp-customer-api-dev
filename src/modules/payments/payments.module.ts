// payment/payment.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StripeService } from './stripe.service';
import { PaymentService } from './services/payments.service';
import { PaymentToken } from './entities/payment-token.entity';
import { PaymentController } from './payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentToken]), ConfigModule],
  providers: [StripeService, PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
