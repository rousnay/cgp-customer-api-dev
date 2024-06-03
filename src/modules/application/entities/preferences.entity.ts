import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Repository,
} from 'typeorm';

@Entity()
export class Preferences extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  //   static async createInitialOptions(
  //     repo: Repository<CustomerPreferences>,
  //   ): Promise<void> {
  //     const options = [
  //       { name: 'Interior Equipments' },
  //       { name: 'Exterior Equipment' },
  //       { name: 'Building Supplies' },
  //       { name: 'Architectural Equipment' },
  //       { name: 'Tools & Accessories' },
  //       { name: 'Gardening & Fencing' },
  //       { name: 'Landscaping & Outdoors' },
  //     ];

  //     for (const option of options) {
  //       await repo.save(option);
  //     }
  //   }
}
