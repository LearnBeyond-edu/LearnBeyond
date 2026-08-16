import api from './api';
import type { ApiResponse, StaffProfile, StudentProfile, ParentProfile, TherapistProfile, Notification, Report, Setting, LauraMemory } from '@/types/platform';

// ─── Staff (Teachers) ─────────────────────────────────────────────────────────
export const staffService = {
  getAll: async (limit = 100, cursor?: string) => {
    const response = await api.get<ApiResponse<StaffProfile[]>>('/staff_profiles', {
      params: { limit, ...(cursor ? { cursor } : {}) },
    });
    return response.data;
  },
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentService = {
  getAll: async (limit = 100, cursor?: string) => {
    const response = await api.get<ApiResponse<StudentProfile[]>>('/student_profiles', {
      params: { limit, ...(cursor ? { cursor } : {}) },
    });
    return response.data;
  },
};

// ─── Parents ──────────────────────────────────────────────────────────────────
export const parentService = {
  getAll: async (limit = 100, cursor?: string) => {
    const response = await api.get<ApiResponse<ParentProfile[]>>('/parent_profiles', {
      params: { limit, ...(cursor ? { cursor } : {}) },
    });
    return response.data;
  },
};

// ─── Therapists ───────────────────────────────────────────────────────────────
export const therapistService = {
  getAll: async (limit = 100, cursor?: string) => {
    const response = await api.get<ApiResponse<TherapistProfile[]>>('/therapist_profiles', {
      params: { limit, ...(cursor ? { cursor } : {}) },
    });
    return response.data;
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications');
    return response.data;
  },
  create: async (payload: Partial<Notification>) => {
    const response = await api.post<ApiResponse<Notification>>('/notifications', payload);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/notifications/${id}`);
  },
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Report[]>>('/reports');
    return response.data;
  },
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Setting[]>>('/settings');
    return response.data;
  },
};

// ─── Laura Memory ─────────────────────────────────────────────────────────────
export const lauraService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<LauraMemory[]>>('/laura_memory');
    return response.data;
  },
};
