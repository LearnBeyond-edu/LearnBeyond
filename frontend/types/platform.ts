// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

// ─── Institution ──────────────────────────────────────────────────────────────

export interface Institution {
  id: string;
  name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  subscription_plan?: string;
  subscription_status?: string;
}

export interface CreateInstitutionPayload {
  name: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  subscription_plan?: string;
  subscription_status?: string;
  password?: string;
}

export type UpdateInstitutionPayload = Partial<CreateInstitutionPayload>;

// ─── Staff / Users ────────────────────────────────────────────────────────────

export interface StaffProfile {
  id: string;
  user_id: string;
  institution_id: string;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  institution_id: string;
  created_at: string;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  created_at: string;
}

export interface TherapistProfile {
  id: string;
  user_id: string;
  institution_id: string;
  created_at: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Report ───────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  type: string;
  title: string;
  created_at: string;
  data: Record<string, unknown>;
}

// ─── Setting ──────────────────────────────────────────────────────────────────

export interface Setting {
  id: string;
  key: string;
  value: string;
}

// ─── Laura Memory ─────────────────────────────────────────────────────────────

export interface LauraMemory {
  id: string;
  student_id: string;
  memory_key: string;
  memory_value: string;
  created_at: string;
}

// ─── Dashboard Stats (derived from API data) ──────────────────────────────────

export interface PlatformStats {
  totalInstitutions: number;
  activeInstitutions: number;
  inactiveInstitutions: number;
  totalStaff: number;
  totalStudents: number;
  totalParents: number;
  totalTherapists: number;
}
