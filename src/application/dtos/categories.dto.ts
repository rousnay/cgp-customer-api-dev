export class CategoriesDto {
  id: number;
  name: string;
  slug: string;
  parent_id: number;
  grand_parent_id: number;
  serial: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}
