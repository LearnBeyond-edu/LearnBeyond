import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import { classService, lessonService, teacherService, studentService, parentService, therapistService, attendanceService, assignmentService, progressService } from '@/services/schoolService';
import type { CreateClassPayload, UpdateClassPayload, CreateLessonPayload, UpdateLessonPayload } from '@/types/school';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const SCHOOL_KEYS = {
  classes: ['classes'] as const,
  class: (id: string) => ['classes', id] as const,
  lessons: ['lessons'] as const,
  lesson: (id: string) => ['lessons', id] as const,
  teachers: ['staff_profiles'] as const,
  teacher: (id: string) => ['staff_profiles', id] as const,
  students: ['student_profiles'] as const,
  student: (id: string) => ['student_profiles', id] as const,
  parents: ['parent_profiles'] as const,
  parent: (id: string) => ['parent_profiles', id] as const,
  therapists: ['therapist_profiles'] as const,
  therapist: (id: string) => ['therapist_profiles', id] as const,
  attendance: ['attendance'] as const,
  assignments: ['assignments'] as const,
  progress: ['progress'] as const,
};

// ─── Classes ──────────────────────────────────────────────────────────────────
export const useClasses = (limit = 20) =>
  useInfiniteQuery({
    queryKey: [...SCHOOL_KEYS.classes, 'list', limit],
    queryFn: ({ pageParam }) => classService.getAll(limit, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 30_000,
  });

export const useClass = (id: string) =>
  useQuery({ queryKey: SCHOOL_KEYS.class(id), queryFn: () => classService.getOne(id), enabled: !!id });

export const useCreateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassPayload) => classService.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.classes }); toast.success('Class created'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create class'),
  });
};

export const useUpdateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClassPayload }) => classService.update(id, payload),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.classes }); qc.setQueryData(SCHOOL_KEYS.class(data.id), data); toast.success('Class updated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update class'),
  });
};

export const useDeleteClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.classes }); toast.success('Class deleted'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to delete class'),
  });
};

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const useLessons = (limit = 50) =>
  useInfiniteQuery({
    queryKey: [...SCHOOL_KEYS.lessons, 'list', limit],
    queryFn: ({ pageParam }) => lessonService.getAll(limit, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 30_000,
  });

export const useCreateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLessonPayload) => lessonService.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.lessons }); toast.success('Lesson created'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create lesson'),
  });
};

export const useDeleteLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.lessons }); toast.success('Lesson deleted'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to delete lesson'),
  });
};

export const useLesson = (id: string) =>
  useQuery({ queryKey: SCHOOL_KEYS.lesson(id), queryFn: () => lessonService.getOne(id), enabled: !!id });

export const useUpdateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLessonPayload }) => lessonService.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: SCHOOL_KEYS.lessons });
      qc.invalidateQueries({ queryKey: SCHOOL_KEYS.lesson(id) });
      toast.success('Lesson updated');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update lesson'),
  });
};

// ─── Teachers ─────────────────────────────────────────────────────────────────
export const useTeachers = (limit = 50) =>
  useInfiniteQuery({
    queryKey: [...SCHOOL_KEYS.teachers, 'list', limit],
    queryFn: ({ pageParam }) => teacherService.getAll(limit, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 60_000,
  });

export const useTeacher = (id: string) =>
  useQuery({ queryKey: SCHOOL_KEYS.teacher(id), queryFn: () => teacherService.getOne(id), enabled: !!id });

export const useDeleteTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teacherService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.teachers }); toast.success('Teacher removed'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to remove teacher'),
  });
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const useStudents = (limit = 50) =>
  useInfiniteQuery({
    queryKey: [...SCHOOL_KEYS.students, 'list', limit],
    queryFn: ({ pageParam }) => studentService.getAll(limit, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 60_000,
  });

export const useStudent = (id: string) =>
  useQuery({ queryKey: SCHOOL_KEYS.student(id), queryFn: () => studentService.getOne(id), enabled: !!id });

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.students }); toast.success('Student removed'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to remove student'),
  });
};

// ─── Parents ──────────────────────────────────────────────────────────────────
export const useParents = (limit = 50) =>
  useInfiniteQuery({
    queryKey: [...SCHOOL_KEYS.parents, 'list', limit],
    queryFn: ({ pageParam }) => parentService.getAll(limit, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 60_000,
  });

export const useParent = (id: string) =>
  useQuery({ queryKey: SCHOOL_KEYS.parent(id), queryFn: () => parentService.getOne(id), enabled: !!id });

export const useDeleteParent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => parentService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.parents }); toast.success('Parent removed'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to remove parent'),
  });
};

// ─── Therapists ───────────────────────────────────────────────────────────────
export const useTherapists = (limit = 50) =>
  useInfiniteQuery({
    queryKey: [...SCHOOL_KEYS.therapists, 'list', limit],
    queryFn: ({ pageParam }) => therapistService.getAll(limit, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 60_000,
  });

export const useTherapist = (id: string) =>
  useQuery({ queryKey: SCHOOL_KEYS.therapist(id), queryFn: () => therapistService.getOne(id), enabled: !!id });

// ─── Attendance ───────────────────────────────────────────────────────────────
export const useAttendance = () =>
  useInfiniteQuery({
    queryKey: SCHOOL_KEYS.attendance,
    queryFn: ({ pageParam }) => attendanceService.getAll(100, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 30_000,
  });

// ─── Assignments ──────────────────────────────────────────────────────────────
export const useAssignments = () =>
  useInfiniteQuery({
    queryKey: SCHOOL_KEYS.assignments,
    queryFn: ({ pageParam }) => assignmentService.getAll(50, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 60_000,
  });

// ─── Progress ─────────────────────────────────────────────────────────────────
export const useProgress = (filters?: Record<string, any>) =>
  useInfiniteQuery({
    queryKey: [...SCHOOL_KEYS.progress, filters],
    queryFn: ({ pageParam }) => progressService.getAll(100, pageParam as string | undefined, filters),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 60_000,
  });

export const useCreateProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => api.post('/progress', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.progress }); },
    onError: (e: any) => { console.error("Progress save failed", e); },
  });
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────
import { quizService, submissionService } from '@/services/schoolService';
import type { CreateQuizPayload, CreateAssignmentPayload, MarkAttendancePayload } from '@/types/school';

export const useQuizzes = (limit = 50) =>
  useInfiniteQuery({
    queryKey: ['quizzes'],
    queryFn: ({ pageParam }) => quizService.getAll(limit, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 60_000,
  });

export const useQuiz = (id: string) =>
  useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => quizService.getOne(id),
    enabled: !!id,
  });

export const useCreateQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuizPayload) => quizService.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quizzes'] }); toast.success('Quiz created'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create quiz'),
  });
};

export const useDeleteQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quizService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quizzes'] }); toast.success('Quiz deleted'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to delete quiz'),
  });
};

// ─── Submissions ──────────────────────────────────────────────────────────────
export const useSubmissions = (filters?: Record<string, any>, limit = 50) =>
  useInfiniteQuery({
    queryKey: ['submissions', filters],
    queryFn: ({ pageParam }) => submissionService.getAll(limit, pageParam as string | undefined, filters),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.meta?.hasNextPage ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 60_000,
  });

export const useUpdateSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => submissionService.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['submissions'] }); toast.success('Submission updated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update submission'),
  });
};

export const useCreateSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => submissionService.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['submissions'] }); },
    onError: (e: any) => { console.error("Submission failed", e); },
  });
};

// ─── Extended Assignment & Attendance Mutations ───────────────────────────────
export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => api.post('/assignments', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.assignments }); toast.success('Assignment created'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create assignment'),
  });
};

export const useDeleteAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/assignments/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.assignments }); toast.success('Assignment deleted'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to delete assignment'),
  });
};

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkAttendancePayload) => api.post('/attendance', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SCHOOL_KEYS.attendance }); toast.success('Attendance marked'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to mark attendance'),
  });
};
