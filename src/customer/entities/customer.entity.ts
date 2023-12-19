import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Customer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sosVoterId: string;

  @Column()
  idNumber: number;

  @Column()
  voterStatus: string;

  @Column()
  partyCode: string;

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

  @Column()
  streetNumber: string;

  @Column()
  streetType: string;

  @Column()
  city: string;

  @Column()
  zipCode: string;
}
