export type RegistrationType = 'DUAL' | 'GOVERNMENT' | 'PUBLIC' | 'UNREGISTERED';

export interface MediatorItem {
  id: string;
  key_mediator: string;
  title: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  social_position: string | null;
  mediation_experience: string | null;
  masked_citizen_id: string;
  registration_type: RegistrationType;
  key_gov: string | null;
  gov_status: string | null;
  gov_reg_no: string | null;
  gov_effective_date: string | null;
  gov_expiration_date: string | null;
  is_gov_active: boolean | null;
  key_public: string | null;
  public_status: string | null;
  public_reg_no: string | null;
  public_effective_date: string | null;
  public_expiration_date: string | null;
  is_public_active: boolean | null;
  is_active_overall: boolean;
}

export interface MediatorKPISummary {
  total: number;
  dualCount: number;
  govCount: number;
  publicCount: number;
  unregisteredCount: number;
  activeCount: number;
  inactiveCount: number;
}

export interface MediatorFilters {
  search?: string;
  province?: string;
  type?: string;
  status?: string;
  gender?: string;
  page?: number;
  pageSize?: number;
}
