import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';

@Controller()
@ApiTags('Application')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  async totalRiders(): Promise<any> {
    return this.appService.getHelloAsync();
  }

  @Get('app/info')
  getInfo(): string {
    return this.appService.getHello();
  }

  @Get('app/version')
  getVersion(): Promise<any> {
    return this.appService.appVersion();
  }
}
