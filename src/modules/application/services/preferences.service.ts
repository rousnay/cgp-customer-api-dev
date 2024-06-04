import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Preferences } from '../entities/preferences.entity';
import { AddPreferencesDto } from '../dtos/add-preferences.dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(Preferences)
    private readonly preferenceRepository: Repository<Preferences>,
  ) {}

  async createInitialOptions(): Promise<void> {
    const options = [
      { name: 'Interior Equipments' },
      { name: 'Exterior Equipment' },
      { name: 'Building Supplies' },
      { name: 'Architectural Equipment' },
      { name: 'Tools & Accessories' },
      { name: 'Gardening & Fencing' },
      { name: 'Landscaping & Outdoors' },
    ];

    for (const option of options) {
      await this.preferenceRepository.save(option);
    }
  }

  async findAll(): Promise<Preferences[]> {
    return this.preferenceRepository.find();
  }

  async addPreference(AddPreferencesDto: AddPreferencesDto): Promise<void> {
    const preference = this.preferenceRepository.create(AddPreferencesDto);
    await this.preferenceRepository.save(preference);
  }
}
