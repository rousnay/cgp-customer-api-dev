// src/variables.ts
// import { DataSource } from 'typeorm';

// export const dataSource = new DataSource({
//   type: 'mysql',
//   host: 'localhost', // Adjust according to your config
//   port: 3306,
//   username: 'your-username',
//   password: 'your-password',
//   database: 'your-database',
//   // Add other necessary options like entities, migrations, etc.
// });
// export const app = {
//   variables: {
//     tradebar_fee: {
//       get id(): Promise<number | null> {
//         return (async () => {
//           const result = await dataSource
//             .createQueryBuilder()
//             .select('id')
//             .from('tradebar_fees', 'tf')
//             .where('status = :status', { status: 1 })
//             .getRawOne();
//           return result ? result.id : null;
//         })();
//       },
//       get value(): Promise<number | null> {
//         return (async () => {
//           const result = await dataSource
//             .createQueryBuilder()
//             .select('percentage')
//             .from('tradebar_fees', 'tf')
//             .where('status = :status', { status: 1 })
//             .getRawOne();
//           return result ? result.percentage : null;
//         })();
//       },
//     },
//   },
// };

// import { Injectable } from '@nestjs/common';
// import { InjectEntityManager } from '@nestjs/typeorm';
// import { EntityManager } from 'typeorm';

// @Injectable()
// export class VariablesService {
//   constructor(@InjectEntityManager() private entityManager: EntityManager) {}

//   async getTradebarFeeId(): Promise<number | null> {
//     const result = await this.entityManager
//       .createQueryBuilder()

export const AppVariables = {
  tradebar_fee: {
    id: 1 as const,
    percentage: 20.0 as const,
  },
};

// src/variables.ts
// import { EntityManager } from 'typeorm';
// let entityManager: EntityManager;

// export const setEntityManager = (manager: EntityManager) => {
//   entityManager = manager;
// };

// export const AppVariables = {
//   tradebar_fee: {
//     get id(): Promise<number | null> {
//       return (async () => {
//         const result = await entityManager
//           .createQueryBuilder()
//           .select('id')
//           .from('tradebar_fees', 'tf')
//           .where('status = :status', { status: true })
//           .getOne();
//         return result ? result.id : null;
//       })();
//     },
//     get percentage(): Promise<number | null> {
//       return (async () => {
//         const result = await entityManager
//           .createQueryBuilder()
//           .select('percentage')
//           .from('tradebar_fees', 'tf')
//           .where('status = :status', { status: true })
//           .getOne();
//         return result ? result.percentage : null;
//       })();
//     },
//   },
// };
