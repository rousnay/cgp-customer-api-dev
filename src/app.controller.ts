import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

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

  // @Get('app/version')
  // appVersion(): Promise<any> {
  //   return this.appService.appVersion();
  // }

  // Get the current app version by app_name (inside the data)

  @Get('app/version')
  @ApiResponse({ status: 200, description: 'Get the app version details.' })
  async getVersion(): Promise<any> {
    const appVersion = await this.appService.getAppVersion();
    return appVersion.data; // Return the whole data object
  }

  // Update existing app version by app_name (inside the data object)

  @Put('app/version')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiBody({ schema: { example: {} } }) // This creates a blank body in Swagger UI
  @ApiResponse({
    status: 200,
    description: 'The app version has been updated.',
  })
  async updateVersion(@Body() updateData: any): Promise<any> {
    return this.appService.updateAppVersion(updateData);
  }
}
