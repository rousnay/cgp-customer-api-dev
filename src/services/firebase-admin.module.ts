import { Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { ConfigModule } from '@config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class FirebaseAdminModule {}
