import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PreferencesService } from '../services/preferences.service';
import { Preferences } from '../entities/preferences.entity';
import { AddPreferencesDto } from '../dtos/add-preferences.dto';

@Controller('preferences')
@ApiTags('Application')
export class PreferencesController {
  constructor(private readonly preferenceService: PreferencesService) {}

  @Get()
  async findAll(): Promise<Preferences[]> {
    return this.preferenceService.findAll();
  }

  @Post()
  async addPreference(
    @Body() AddPreferencesDto: AddPreferencesDto,
  ): Promise<void> {
    await this.preferenceService.addPreference(AddPreferencesDto);
  }
}
