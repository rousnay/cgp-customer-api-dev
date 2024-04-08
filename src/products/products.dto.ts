export class ProductsDto {
  id: number;
  name: string;
  slug: string;
  barcode: string;
  product_type_id: number;
  category_id: number;
  primary_category_id: number;
  brand_id: number;
  unit_type_id: number;
  unit: string;
  size_id: number;
  colour_id: number;
  group_id: number;
  weight: number;
  short_desc: string;
  long_desc: string;
  details_overview: string;
  details_specifications: string;
  details_size_and_materials: string;
  status_id: number;
  active: boolean;
  creator_id: number;
  editor_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
