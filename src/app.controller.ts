import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBody, ApiConsumes, ApiTags, ApiQuery } from '@nestjs/swagger';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
