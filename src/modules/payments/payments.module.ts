import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@config/config.module';
import { StripeService } from './services/stripe.service';
import { PaymentService } from './services/payments.service';
import { PaymentToken } from './entities/payment-token.entity';
import { PaymentController } from './payments.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([PaymentToken])],
  providers: [StripeService, PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
