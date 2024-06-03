import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get environment(): string {
    return this.configService.get<string>('environment');
  }

  get port(): number {
    return this.configService.get<number>('port');
  }

  get appName(): string {
    return this.configService.get<string>('app.name');
  }

  get appDescription(): string {
    return this.configService.get<string>('app.description');
  }

  get appVersion(): string {
    return this.configService.get<string>('app.version');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('jwt.secret');
  }

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

  get mongodbUri(): string {
    return this.configService.get<string>('mongodb.uri');
  }

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

  get stripePublishableKey(): string {
    return this.configService.get<string>('stripe.publishableKey');
  }

  get stripeSecretKey(): string {
    return this.configService.get<string>('stripe.secretKey');
  }

  get stripeWebhookSecret(): string {
    return this.configService.get<string>('stripe.webhookSecret');
  }
  get cloudflareAccountId(): string {
    return this.configService.get<string>('cloudflare.accountId');
  }

  get cloudflareApiToken(): string {
    return this.configService.get<string>('cloudflare.apiToken');
  }

  get cloudflareAccountHash(): string {
    return this.configService.get<string>('cloudflare.accountHash');
  }

  get firebaseProjectId(): string {
    return this.configService.get<string>('firebase.projectId');
  }

  get firebaseClientEmail(): string {
    return this.configService.get<string>('firebase.clientEmail');
  }

  get firebasePrivateKey(): string {
    return this.configService.get<string>('firebase.privateKey');
  }
}
