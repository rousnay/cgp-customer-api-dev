// payment/payment.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { PaymentController } from './payments.controller';

@Module({
  imports: [ConfigModule],
  providers: [StripeService],
  controllers: [PaymentController],
})
export class PaymentModule {}
