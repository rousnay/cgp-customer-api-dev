import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  //App Configurations
  get environment(): string {
    return this.configService.get<string>('environment');
  }

  get port(): number {
    return this.configService.get<number>('port');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('jwt.secret');
  }

  //Database Configuration: MySQL
  get mysqlHost(): string {
    return this.configService.get<string>('mysql.host');
  }

  get mysqlPort(): number {
    return this.configService.get<number>('mysql.port');
  }

  get mysqlUsername(): string {
    return this.configService.get<string>('mysql.username');
  }

  get mysqlPassword(): string {
    return this.configService.get<string>('mysql.password');
  }

  get mysqlDatabase(): string {
    return this.configService.get<string>('mysql.database');
  }

  //Database Configuration: MongoDB
  get mongodbUri(): string {
    return this.configService.get<string>('mongodb.uri');
  }

  //Google Maps Configuration
  get googleMapsApiKey(): string {
    return this.configService.get<string>('google.mapsApiKey');
  }

  //Cloudflare Configuration
  get cloudflareAccountId(): string {
    return this.configService.get<string>('cloudflare.accountId');
  }

  get cloudflareApiToken(): string {
    return this.configService.get<string>('cloudflare.apiToken');
  }

  get cloudflareAccountHash(): string {
    return this.configService.get<string>('cloudflare.accountHash');
  }

  //Firebase Configuration
  get firebaseProjectId(): string {
    return this.configService.get<string>('firebase.projectId');
  }

  get firebaseClientEmail(): string {
    return this.configService.get<string>('firebase.clientEmail');
  }

  get firebasePrivateKey(): string {
    return this.configService.get<string>('firebase.privateKey');
  }

  //Stripe Configuration
  get stripePublishableKey(): string {
    return this.configService.get<string>('stripe.publishableKey');
  }

  get stripeSecretKey(): string {
    return this.configService.get<string>('stripe.secretKey');
  }

  get stripeWebhookUniqueId(): string {
    return this.configService.get<string>('stripe.webhookUniqueId');
  }

  get stripeWebhookSigningSecret(): string {
    const env = this.configService.get<string>('environment');
    if (env === 'development') {
      return this.configService.get<string>('stripe.webhookSigningSecretLocal');
    } else if (env === 'staging') {
      return this.configService.get<string>(
        'stripe.webhookSigningSecretStaging',
      );
    }
  }

  //Logger Configuration
  get loggerLevel(): string {
    return this.configService.get<string>('logger.level');
  }

  get loggerDebug(): string {
    return this.configService.get<string>('logger.debug');
  }

  get loggerUseJson(): boolean {
    return this.configService.get<boolean>('logger.json');
  }

  get sentryDns(): string {
    return this.configService.get<string>('logger.sentryDns');
  }
}
