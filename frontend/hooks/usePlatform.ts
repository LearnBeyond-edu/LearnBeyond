import { useQuery } from '@tanstack/react-query';
import { staffService, studentService, parentService, therapistService, notificationService, reportService, settingService, lauraService } from '@/services/platformService';

export const PLATFORM_KEYS = {
  staff: ['staff_profiles'] as const,
  students: ['student_profiles'] as const,
  parents: ['parent_profiles'] as const,
  therapists: ['therapist_profiles'] as const,
  notifications: ['notifications'] as const,
  reports: ['reports'] as const,
  settings: ['settings'] as const,
  laura: ['laura_memory'] as const,
};

export const useStaff = () =>
  useQuery({ queryKey: PLATFORM_KEYS.staff, queryFn: () => staffService.getAll(), staleTime: 60_000 });

export const useStudents = () =>
  useQuery({ queryKey: PLATFORM_KEYS.students, queryFn: () => studentService.getAll(), staleTime: 60_000 });

export const useParents = () =>
  useQuery({ queryKey: PLATFORM_KEYS.parents, queryFn: () => parentService.getAll(), staleTime: 60_000 });

export const useTherapists = () =>
  useQuery({ queryKey: PLATFORM_KEYS.therapists, queryFn: () => therapistService.getAll(), staleTime: 60_000 });

export const useNotifications = () =>
  useQuery({ queryKey: PLATFORM_KEYS.notifications, queryFn: () => notificationService.getAll(), staleTime: 30_000 });

export const useReports = () =>
  useQuery({ queryKey: PLATFORM_KEYS.reports, queryFn: () => reportService.getAll(), staleTime: 60_000 });

export const useSettings = () =>
  useQuery({ queryKey: PLATFORM_KEYS.settings, queryFn: () => settingService.getAll(), staleTime: 300_000 });

export const useLauraMemory = () =>
  useQuery({ queryKey: PLATFORM_KEYS.laura, queryFn: () => lauraService.getAll(), staleTime: 60_000 });
