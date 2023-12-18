import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CustomerEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  middleName: string;

  @Column()
  lastName: string;

  @Column()
  sex: string;

  @Column()
  birthDate: string;

  @Column()
  streetName: string;
}
