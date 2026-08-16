import api from './api';
import type { CursorResponse } from '@/types/school';
import type { SchoolClass, CreateClassPayload, UpdateClassPayload } from '@/types/school';
import type { Lesson, CreateLessonPayload, UpdateLessonPayload } from '@/types/school';
import type { StaffProfile, StudentProfile, ParentProfile, TherapistProfile } from '@/types/school';
import type { AttendanceRecord, Assignment, Progress, Feedback } from '@/types/school';
import type { ApiResponse } from '@/types/platform';

// ─── Classes ──────────────────────────────────────────────────────────────────
export const classService = {
  getAll: async (limit = 20, cursor?: string): Promise<CursorResponse<SchoolClass>> => {
    const res = await api.get<ApiResponse<SchoolClass[]>>('/classes', { params: { limit, ...(cursor ? { cursor } : {}) } });
    return { data: res.data.data, meta: res.data.meta as any };
  },
  getOne: async (id: string): Promise<SchoolClass> => {
    const res = await api.get<ApiResponse<SchoolClass>>(`/classes/${id}`);
    return res.data.data;
  },
  create: async (payload: CreateClassPayload): Promise<SchoolClass> => {
    const res = await api.post<ApiResponse<SchoolClass>>('/classes', payload);
    return res.data.data;
  },
  update: async (id: string, payload: UpdateClassPayload): Promise<SchoolClass> => {
    const res = await api.put<ApiResponse<SchoolClass>>(`/classes/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/classes/${id}`);
  },
};

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lessonService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<Lesson>> => {
    const res = await api.get<ApiResponse<Lesson[]>>('/lessons', { params: { limit, ...(cursor ? { cursor } : {}) } });
    return { data: res.data.data, meta: res.data.meta as any };
  },
  getOne: async (id: string): Promise<Lesson> => {
    const res = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    return res.data.data;
  },
  create: async (payload: CreateLessonPayload): Promise<Lesson> => {
    const res = await api.post<ApiResponse<Lesson>>('/lessons', payload);
    return res.data.data;
  },
  update: async (id: string, payload: UpdateLessonPayload): Promise<Lesson> => {
    const res = await api.put<ApiResponse<Lesson>>(`/lessons/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/lessons/${id}`);
  },
};

// ─── Staff (Teachers) ─────────────────────────────────────────────────────────
export const teacherService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<StaffProfile>> => {
    const res = await api.get<ApiResponse<StaffProfile[]>>('/staff_profiles', { params: { limit, ...(cursor ? { cursor } : {}) } });
    return { data: res.data.data, meta: res.data.meta as any };
  },
  getOne: async (id: string): Promise<StaffProfile> => {
    const res = await api.get<ApiResponse<StaffProfile>>(`/staff_profiles/${id}`);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/staff_profiles/${id}`);
  },
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<StudentProfile>> => {
    const res = await api.get<ApiResponse<StudentProfile[]>>('/student_profiles', { params: { limit, ...(cursor ? { cursor } : {}) } });
    return { data: res.data.data, meta: res.data.meta as any };
  },
  getOne: async (id: string): Promise<StudentProfile> => {
    const res = await api.get<ApiResponse<StudentProfile>>(`/student_profiles/${id}`);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/student_profiles/${id}`);
  },
};

// ─── Parents ──────────────────────────────────────────────────────────────────
export const parentService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<ParentProfile>> => {
    const res = await api.get<ApiResponse<ParentProfile[]>>('/parent_profiles', { params: { limit, ...(cursor ? { cursor } : {}) } });
    return { data: res.data.data, meta: res.data.meta as any };
  },
  getOne: async (id: string): Promise<ParentProfile> => {
    const res = await api.get<ApiResponse<ParentProfile>>(`/parent_profiles/${id}`);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/parent_profiles/${id}`);
  },
};

// ─── Therapists ───────────────────────────────────────────────────────────────
export const therapistService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<TherapistProfile>> => {
    const res = await api.get<ApiResponse<TherapistProfile[]>>('/therapist_profiles', { params: { limit, ...(cursor ? { cursor } : {}) } });
    return { data: res.data.data, meta: res.data.meta as any };
  },
  getOne: async (id: string): Promise<TherapistProfile> => {
    const res = await api.get<ApiResponse<TherapistProfile>>(`/therapist_profiles/${id}`);
    return res.data.data;
  },
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceService = {
  getAll: async (limit = 100, cursor?: string): Promise<CursorResponse<AttendanceRecord>> => {
    const res = await api.get<ApiResponse<AttendanceRecord[]>>('/attendance', { params: { limit, ...(cursor ? { cursor } : {}) } });
    return { data: res.data.data, meta: res.data.meta as any };
  },
};

// ─── Assignments ──────────────────────────────────────────────────────────────
export const assignmentService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<Assignment>> => {
    const res = await api.get<ApiResponse<Assignment[]>>('/assignments', { params: { limit, ...(cursor ? { cursor } : {}) } });
    return { data: res.data.data, meta: res.data.meta as any };
  },
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressService = {
  getAll: async (limit = 100, cursor?: string, filters?: Record<string, any>): Promise<CursorResponse<Progress>> => {
    const res = await api.get<ApiResponse<Progress[]>>('/progress', { 
      params: { limit, ...(cursor ? { cursor } : {}), ...filters } 
    });
    return { data: res.data.data, meta: res.data.meta as any };
  },
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────
import type { Quiz, CreateQuizPayload } from '@/types/school';
export const quizService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<Quiz>> => {
    const res = await api.get<ApiResponse<Quiz[]>>('/quizzes', { params: { limit, ...(cursor ? { cursor } : {}) } });
    return { data: res.data.data, meta: res.data.meta as any };
  },
  getOne: async (id: string): Promise<Quiz> => {
    const res = await api.get<ApiResponse<Quiz>>(`/quizzes/${id}`);
    return res.data.data;
  },
  create: async (payload: CreateQuizPayload): Promise<Quiz> => {
    const res = await api.post<ApiResponse<Quiz>>('/quizzes', payload);
    return res.data.data;
  },
  update: async (id: string, payload: Partial<CreateQuizPayload>): Promise<Quiz> => {
    const res = await api.put<ApiResponse<Quiz>>(`/quizzes/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/quizzes/${id}`);
  }
};

// ─── Submissions ──────────────────────────────────────────────────────────────
import type { Submission } from '@/types/school';
export const submissionService = {
  getAll: async (limit = 50, cursor?: string, filters?: Record<string, any>): Promise<CursorResponse<Submission>> => {
    const res = await api.get<ApiResponse<Submission[]>>('/submissions', { 
      params: { limit, ...(cursor ? { cursor } : {}), ...filters } 
    });
    return { data: res.data.data, meta: res.data.meta as any };
  },
  getOne: async (id: string): Promise<Submission> => {
    const res = await api.get<ApiResponse<Submission>>(`/submissions/${id}`);
    return res.data.data;
  },
  create: async (payload: any): Promise<Submission> => {
    const res = await api.post<ApiResponse<Submission>>('/submissions', payload);
    return res.data.data;
  },
  update: async (id: string, payload: Partial<Submission>): Promise<Submission> => {
    const res = await api.put<ApiResponse<Submission>>(`/submissions/${id}`, payload);
    return res.data.data;
  }
};
