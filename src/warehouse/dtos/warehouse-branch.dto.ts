export class WarehouseBranchDto {
  id: number;
  warehouse_id: number;
  branch_type: string;
  email: string;
  website: string;
  phone: string;
  address: string;
  contact_person_id: number;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}
