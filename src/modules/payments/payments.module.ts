import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@config/config.module';
import { PaymentToken } from './entities/payment-token.entity';
import { PaymentService } from './payments.service';
import { PaymentController } from './payments.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([PaymentToken])],
  exports: [PaymentService],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
