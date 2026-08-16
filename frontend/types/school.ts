// ─── Cursor-based pagination meta ────────────────────────────────────────────
export interface CursorMeta {
  hasNextPage: boolean;
  nextCursor: string | null;
}

export interface CursorResponse<T> {
  data: T[];
  meta: CursorMeta;
}

// ─── Class ────────────────────────────────────────────────────────────────────
export interface SchoolClass {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  teacher_id: string | null;
  class_teacher_id: string | null;
  grade: number;
  section: string;
  academic_year: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateClassPayload {
  institution_id: string;
  name: string;
  description?: string;
  teacher_id?: string;
}

export type UpdateClassPayload = Pick<CreateClassPayload, 'name' | 'description' | 'teacher_id'>;

// ─── Lesson ───────────────────────────────────────────────────────────────────
export interface Lesson {
  id: string;
  class_id: string;
  created_by: string;
  title: string;
  description: string | null;
  content: string | null;
  scheduled_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLessonPayload {
  class_id: string;
  title: string;
  description?: string;
  content?: string;
  scheduled_time?: string;
}

export type UpdateLessonPayload = Omit<CreateLessonPayload, 'class_id'>;

// ─── Staff Profile (Teachers) ─────────────────────────────────────────────────
export interface StaffProfile {
  id: string;
  user_id: string;
  institution_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ─── Student Profile ──────────────────────────────────────────────────────────
export interface StudentProfile {
  id: string;
  user_id: string;
  institution_id: string;
  first_name: string | null;
  last_name: string | null;
  admission_number?: string | null;
  class_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ─── Parent Profile ───────────────────────────────────────────────────────────
export interface ParentProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  student_id: string | null;
  relation: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ─── Therapist Profile ────────────────────────────────────────────────────────
export interface TherapistProfile {
  id: string;
  user_id: string;
  institution_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: string;
  created_at: string;
}

// ─── Assignment ───────────────────────────────────────────────────────────────
export interface Assignment {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export interface Progress {
  id: string;
  student_id: string;
  lesson_id: string;
  status: string;
  score: number | null;
  created_at: string;
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
export interface Feedback {
  id: string;
  student_id: string;
  class_id: string;
  content: string;
  created_at: string;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export interface Quiz {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  time_limit: number | null; // in minutes
  questions: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface CreateQuizPayload {
  class_id: string;
  title: string;
  description?: string;
  due_date?: string;
  time_limit?: number;
  questions?: any;
}

// ─── Submission ───────────────────────────────────────────────────────────────
export interface Submission {
  id: string;
  assignment_id?: string;
  quiz_id?: string;
  student_id: string;
  content: string | null;
  answers?: any; // JSONB
  score: number | null;
  feedback: string | null;
  status: 'pending' | 'graded' | 'returned';
  created_at: string;
  updated_at: string;
}

// ─── Extended Assignment Types ────────────────────────────────────────────────
export interface CreateAssignmentPayload {
  class_id: string;
  title: string;
  description?: string;
  due_date?: string;
}

export interface MarkAttendancePayload {
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}
