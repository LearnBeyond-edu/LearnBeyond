import api from './api';
import type { CursorResponse } from '@/types/school';
import type { SchoolClass, CreateClassPayload, UpdateClassPayload } from '@/types/school';
import type { Lesson, CreateLessonPayload, UpdateLessonPayload } from '@/types/school';
import type { StaffProfile, StudentProfile, ParentProfile, TherapistProfile } from '@/types/school';
import type { AttendanceRecord, Assignment, Progress, Feedback } from '@/types/school';
import type { ApiResponse } from '@/types/platform';

const defaultLessons: Lesson[] = [
  {
    id: "solar-system-1",
    class_id: "cls-space-101",
    created_by: "Jane Smith",
    title: "Interactive Solar System & Orbital Mechanics",
    description: "Explore gravitational equilibrium, planetary orbits, and solar dynamics through interactive simulation and multi-sensory experiments.",
    content: `Learning Objectives:
- Understand gravitational forces and orbital velocity.
- Analyze planetary mass distribution across the solar system.
- Master tactile machinery calibration for space exploration.

Detailed Proper Notes:
Welcome to the Solar System & Orbital Mechanics lesson! The solar system consists of our Sun and everything bound to it by gravity—the planets Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune, dwarf planets such as Pluto, dozens of moons, and millions of asteroids, comets, and meteoroids.

Simulation Calibration Target:
To successfully complete your physical Tactile Sandbox simulation for this lesson, you must calibrate the machinery to these exact specifications:
- Gravity: 9.8 m/s²
- Velocity: 75 km/s
- Thruster: ON

<!-- TACTILE_DATA: {"title": "Interactive Teardown: Solar System Core", "kinesthetic": {"title": "Assemble the Solar System", "items": [{"id": "sun", "label": "SUN", "color": "amber"}, {"id": "earth", "label": "EARTH", "color": "blue"}, {"id": "moon", "label": "MOON", "color": "slate"}], "success": "Orbit Established!", "instructions": ["1. Place the Sun in the gravitational center.", "2. Set Earth in the middle habitable zone.", "3. Position the Moon in Earth's tidal orbit."]}, "layers": [{"id": "l1", "name": "Outer Photosphere", "prompt": "Macro photography of solar flares"}, {"id": "l2", "name": "Convective Zone", "prompt": "Thermal convection plasma"}, {"id": "l3", "name": "Nuclear Core", "prompt": "Nuclear fusion core"}]} -->

Assignment:
Complete the tactile sandbox calibration, test orbital velocity in the Kinesthetic Arena, and submit the 5-question module quiz.`,
    scheduled_time: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "biology-cell-1",
    class_id: "cls-bio-102",
    created_by: "Jane Smith",
    title: "Human Cellular Biology & Organelle Dynamics",
    description: "Deconstruct cellular anatomy, mitochondrial energy production, and membrane transport in an immersive sandbox.",
    content: `Learning Objectives:
- Identify cellular organelles and their biochemical roles.
- Understand ATP synthesis inside mitochondria.
- Calibrate the microscope pan and fine focus parameters.

Detailed Proper Notes:
Cells are the basic structural and functional units of all living organisms. Within eukaryotic cells, specialized membrane-bound structures called organelles perform distinct life-sustaining jobs.

Simulation Calibration Target:
To successfully complete your physical Tactile Sandbox simulation for this lesson, you must calibrate the machinery to these exact specifications:
- Fine Focus: 400
- Pan X: 50
- Pan Y: 50

<!-- TACTILE_DATA: {"title": "Cellular Core Teardown", "kinesthetic": {"title": "Build the Cell", "items": [{"id": "nucleus", "label": "NUCLEUS", "color": "purple"}, {"id": "mito", "label": "MITOCHONDRIA", "color": "red"}, {"id": "membrane", "label": "MEMBRANE", "color": "emerald"}], "success": "Cell Synthesized!", "instructions": ["1. Place the Nucleus in the center.", "2. Place Mitochondria for ATP synthesis.", "3. Enclose with the Cellular Membrane."]}, "layers": [{"id": "l1", "name": "Phospholipid Bilayer", "prompt": "Cell membrane bilayer"}, {"id": "l2", "name": "Cytoplasm Matrix", "prompt": "Cytoplasm organelles"}, {"id": "l3", "name": "Nuclear Chromatin", "prompt": "DNA chromatin"}]} -->

Assignment:
Complete organelle assembly and review cellular transport diagrams.`,
    scheduled_time: new Date().toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const defaultQuizzes: Quiz[] = [
  {
    id: "quiz-solar-1",
    class_id: "cls-space-101",
    title: "Solar System & Orbital Mechanics Assessment",
    description: "5-question timed assessment evaluating planetary orbits and gravitational dynamics.",
    due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    time_limit: 15,
    questions: [
      {
        id: "q1",
        quiz_id: "quiz-solar-1",
        question_text: "What is the primary gravitational anchor at the center of our solar system?",
        question_type: "multiple_choice",
        options: ["The Sun", "Jupiter", "Earth", "Sagittarius A*"],
        correct_answer: "The Sun",
        points: 20,
        order_index: 0
      },
      {
        id: "q2",
        quiz_id: "quiz-solar-1",
        question_text: "Which physical law dictates that planetary orbits are elliptical rather than perfect circles?",
        question_type: "multiple_choice",
        options: ["Kepler's First Law", "Newton's Third Law", "Coulomb's Law", "Bernoulli's Principle"],
        correct_answer: "Kepler's First Law",
        points: 20,
        order_index: 1
      },
      {
        id: "q3",
        quiz_id: "quiz-solar-1",
        question_text: "What happens to orbital velocity as a planet moves closer to the Sun during perihelion?",
        question_type: "multiple_choice",
        options: ["It increases", "It decreases", "It drops to zero", "It remains constant"],
        correct_answer: "It increases",
        points: 20,
        order_index: 2
      },
      {
        id: "q4",
        quiz_id: "quiz-solar-1",
        question_text: "True or False: The Earth's Moon generates gravitational tidal forces on Earth's oceans.",
        question_type: "true_false",
        options: ["True", "False"],
        correct_answer: "True",
        points: 20,
        order_index: 3
      },
      {
        id: "q5",
        quiz_id: "quiz-solar-1",
        question_text: "Which target gravity calibration setting is required for standard Earth surface simulations?",
        question_type: "multiple_choice",
        options: ["9.8 m/s²", "1.6 m/s²", "24.7 m/s²", "0 m/s²"],
        correct_answer: "9.8 m/s²",
        points: 20,
        order_index: 4
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// ─── Classes ──────────────────────────────────────────────────────────────────
export const classService = {
  getAll: async (limit = 20, cursor?: string): Promise<CursorResponse<SchoolClass>> => {
    try {
      const res = await api.get<ApiResponse<SchoolClass[]>>('/classes', { params: { limit, ...(cursor ? { cursor } : {}) } });
      return { data: res.data.data, meta: res.data.meta as any };
    } catch {
      return {
        data: [
          {
            id: "cls-space-101",
            institution_id: "8dffb045-b42c-484d-aa27-b13a93f9790b",
            name: "Grade 4 Space & Physics",
            description: "Astronomy, physics, and multi-sensory experiments.",
            teacher_id: "t-1",
            class_teacher_id: "t-1",
            grade: 4,
            section: "A",
            academic_year: "2026-2027",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          }
        ],
        meta: { hasNextPage: false, nextCursor: null }
      };
    }
  },
  getOne: async (id: string): Promise<SchoolClass> => {
    try {
      const res = await api.get<ApiResponse<SchoolClass>>(`/classes/${id}`);
      return res.data.data;
    } catch {
      return {
        id,
        institution_id: "8dffb045-b42c-484d-aa27-b13a93f9790b",
        name: "Grade 4 Space & Physics",
        description: "Astronomy, physics, and multi-sensory experiments.",
        teacher_id: "t-1",
        class_teacher_id: "t-1",
        grade: 4,
        section: "A",
        academic_year: "2026-2027",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
    }
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
    try {
      const res = await api.get<ApiResponse<Lesson[]>>('/lessons', { params: { limit, ...(cursor ? { cursor } : {}) } });
      if (res.data.data && res.data.data.length > 0) {
        return { data: res.data.data, meta: res.data.meta as any };
      }
      return { data: defaultLessons, meta: { hasNextPage: false, nextCursor: null } };
    } catch {
      return { data: defaultLessons, meta: { hasNextPage: false, nextCursor: null } };
    }
  },
  getOne: async (id: string): Promise<Lesson> => {
    try {
      const res = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`);
      return res.data.data;
    } catch {
      const found = defaultLessons.find(l => l.id === id);
      if (found) return found;
      return {
        ...defaultLessons[0],
        id,
      };
    }
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
    try {
      const res = await api.get<ApiResponse<StaffProfile[]>>('/staff_profiles', { params: { limit, ...(cursor ? { cursor } : {}) } });
      return { data: res.data.data, meta: res.data.meta as any };
    } catch {
      return {
        data: [
          {
            id: "t-1",
            user_id: "u-teacher-1",
            institution_id: "8dffb045-b42c-484d-aa27-b13a93f9790b",
            first_name: "Jane",
            last_name: "Smith",
            phone_number: "555-0101",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          }
        ],
        meta: { hasNextPage: false, nextCursor: null }
      };
    }
  },
  getOne: async (id: string): Promise<StaffProfile> => {
    try {
      const res = await api.get<ApiResponse<StaffProfile>>(`/staff_profiles/${id}`);
      return res.data.data;
    } catch {
      return {
        id,
        user_id: "u-teacher-1",
        institution_id: "8dffb045-b42c-484d-aa27-b13a93f9790b",
        first_name: "Jane",
        last_name: "Smith",
        phone_number: "555-0101",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
    }
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/staff_profiles/${id}`);
  },
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<StudentProfile>> => {
    try {
      const res = await api.get<ApiResponse<StudentProfile[]>>('/student_profiles', { params: { limit, ...(cursor ? { cursor } : {}) } });
      return { data: res.data.data, meta: res.data.meta as any };
    } catch {
      return {
        data: [
          {
            id: "s-1",
            user_id: "u-student-1",
            institution_id: "8dffb045-b42c-484d-aa27-b13a93f9790b",
            first_name: "Johnny",
            last_name: "Appleseed",
            admission_number: "LB-2026-042",
            class_id: "cls-space-101",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          }
        ],
        meta: { hasNextPage: false, nextCursor: null }
      };
    }
  },
  getOne: async (id: string): Promise<StudentProfile> => {
    try {
      const res = await api.get<ApiResponse<StudentProfile>>(`/student_profiles/${id}`);
      return res.data.data;
    } catch {
      return {
        id,
        user_id: "u-student-1",
        institution_id: "8dffb045-b42c-484d-aa27-b13a93f9790b",
        first_name: "Johnny",
        last_name: "Appleseed",
        admission_number: "LB-2026-042",
        class_id: "cls-space-101",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
    }
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/student_profiles/${id}`);
  },
};

// ─── Parents ──────────────────────────────────────────────────────────────────
export const parentService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<ParentProfile>> => {
    try {
      const res = await api.get<ApiResponse<ParentProfile[]>>('/parent_profiles', { params: { limit, ...(cursor ? { cursor } : {}) } });
      return { data: res.data.data, meta: res.data.meta as any };
    } catch {
      return {
        data: [
          {
            id: "p-1",
            user_id: "u-parent-1",
            first_name: "Martha",
            last_name: "Appleseed",
            phone_number: "555-0102",
            student_id: "s-1",
            relation: "Mother",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          }
        ],
        meta: { hasNextPage: false, nextCursor: null }
      };
    }
  },
  getOne: async (id: string): Promise<ParentProfile> => {
    try {
      const res = await api.get<ApiResponse<ParentProfile>>(`/parent_profiles/${id}`);
      return res.data.data;
    } catch {
      return {
        id,
        user_id: "u-parent-1",
        first_name: "Martha",
        last_name: "Appleseed",
        phone_number: "555-0102",
        student_id: "s-1",
        relation: "Mother",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
    }
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/parent_profiles/${id}`);
  },
};

// ─── Therapists ───────────────────────────────────────────────────────────────
export const therapistService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<TherapistProfile>> => {
    try {
      const res = await api.get<ApiResponse<TherapistProfile[]>>('/therapist_profiles', { params: { limit, ...(cursor ? { cursor } : {}) } });
      return { data: res.data.data, meta: res.data.meta as any };
    } catch {
      return {
        data: [
          {
            id: "th-1",
            user_id: "u-therapist-1",
            institution_id: "8dffb045-b42c-484d-aa27-b13a93f9790b",
            first_name: "Dr. John",
            last_name: "Watson",
            phone_number: "555-0103",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          }
        ],
        meta: { hasNextPage: false, nextCursor: null }
      };
    }
  },
  getOne: async (id: string): Promise<TherapistProfile> => {
    try {
      const res = await api.get<ApiResponse<TherapistProfile>>(`/therapist_profiles/${id}`);
      return res.data.data;
    } catch {
      return {
        id,
        user_id: "u-therapist-1",
        institution_id: "8dffb045-b42c-484d-aa27-b13a93f9790b",
        first_name: "Dr. John",
        last_name: "Watson",
        phone_number: "555-0103",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
    }
  },
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceService = {
  getAll: async (limit = 100, cursor?: string): Promise<CursorResponse<AttendanceRecord>> => {
    try {
      const res = await api.get<ApiResponse<AttendanceRecord[]>>('/attendance', { params: { limit, ...(cursor ? { cursor } : {}) } });
      return { data: res.data.data, meta: res.data.meta as any };
    } catch {
      return {
        data: [
          {
            id: "att-1",
            student_id: "s-1",
            class_id: "cls-space-101",
            date: new Date().toISOString().split("T")[0],
            status: "Present",
            created_at: new Date().toISOString(),
          }
        ],
        meta: { hasNextPage: false, nextCursor: null }
      };
    }
  },
};

// ─── Assignments ──────────────────────────────────────────────────────────────
export const assignmentService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<Assignment>> => {
    try {
      const res = await api.get<ApiResponse<Assignment[]>>('/assignments', { params: { limit, ...(cursor ? { cursor } : {}) } });
      return { data: res.data.data, meta: res.data.meta as any };
    } catch {
      return {
        data: [
          {
            id: "asgn-1",
            class_id: "cls-space-101",
            title: "Planetary Orbit & Gravitational Trajectory Lab",
            description: "Calibrate sandbox gravity to 9.8 m/s² and complete the 3D orbital assembly in the Kinesthetic Arena.",
            due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
            created_at: new Date().toISOString(),
          }
        ],
        meta: { hasNextPage: false, nextCursor: null }
      };
    }
  },
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressService = {
  getAll: async (limit = 100, cursor?: string, filters?: Record<string, any>): Promise<CursorResponse<Progress>> => {
    try {
      const res = await api.get<ApiResponse<Progress[]>>('/progress', { 
        params: { limit, ...(cursor ? { cursor } : {}), ...filters } 
      });
      return { data: res.data.data, meta: res.data.meta as any };
    } catch {
      return {
        data: [
          {
            id: "prog-1",
            student_id: "s-1",
            lesson_id: "solar-system-1",
            status: "Completed",
            score: 95,
            created_at: new Date().toISOString(),
          },
          {
            id: "prog-2",
            student_id: "s-1",
            lesson_id: "biology-cell-1",
            status: "In Progress",
            score: 80,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          }
        ],
        meta: { hasNextPage: false, nextCursor: null }
      };
    }
  },
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────
import type { Quiz, CreateQuizPayload } from '@/types/school';
export const quizService = {
  getAll: async (limit = 50, cursor?: string): Promise<CursorResponse<Quiz>> => {
    try {
      const res = await api.get<ApiResponse<Quiz[]>>('/quizzes', { params: { limit, ...(cursor ? { cursor } : {}) } });
      if (res.data.data && res.data.data.length > 0) {
        return { data: res.data.data, meta: res.data.meta as any };
      }
      return { data: defaultQuizzes, meta: { hasNextPage: false, nextCursor: null } };
    } catch {
      return { data: defaultQuizzes, meta: { hasNextPage: false, nextCursor: null } };
    }
  },
  getOne: async (id: string): Promise<Quiz> => {
    try {
      const res = await api.get<ApiResponse<Quiz>>(`/quizzes/${id}`);
      return res.data.data;
    } catch {
      const found = defaultQuizzes.find(q => q.id === id);
      if (found) return found;
      return {
        ...defaultQuizzes[0],
        id,
      };
    }
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
    try {
      const res = await api.get<ApiResponse<Submission[]>>('/submissions', { 
        params: { limit, ...(cursor ? { cursor } : {}), ...filters } 
      });
      return { data: res.data.data, meta: res.data.meta as any };
    } catch {
      return { data: [], meta: {} as any };
    }
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
