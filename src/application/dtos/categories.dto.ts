export class CategoriesDto {
  id: number;
  name: string;
  slug: string;
  parent_id: number;
  grand_parent_id: number;
  serial: number;
  active: boolean;
  product_count: number;
}
