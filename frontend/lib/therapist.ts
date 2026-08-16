export type LocalStorageValue = string | number | boolean | null | undefined | Record<string, unknown> | Array<unknown>;

export function flattenInfinitePages<T>(data: { pages?: Array<{ data?: T[] }> } | undefined): T[] {
  return data?.pages?.flatMap((page) => page.data ?? []) ?? [];
}

export function getDisplayName(record: { first_name?: string | null; last_name?: string | null; firstName?: string | null; lastName?: string | null } | null | undefined, fallback = "Unnamed") {
  const firstName = record?.first_name ?? record?.firstName ?? "";
  const lastName = record?.last_name ?? record?.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || fallback;
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "LB";
}

export function formatDateValue(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function average(values: Array<number | null | undefined>) {
  const filtered = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return filtered.length ? Math.round(filtered.reduce((sum, value) => sum + value, 0) / filtered.length) : 0;
}

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreTone(score: number) {
  if (score >= 90) return "text-emerald-600 bg-emerald-500/10";
  if (score >= 80) return "text-teal-600 bg-teal-500/10";
  if (score >= 70) return "text-amber-600 bg-amber-500/10";
  return "text-rose-600 bg-rose-500/10";
}

export function behaviorTone(value: number) {
  if (value >= 90) return "text-emerald-600 bg-emerald-500/10";
  if (value >= 75) return "text-teal-600 bg-teal-500/10";
  if (value >= 60) return "text-amber-600 bg-amber-500/10";
  return "text-rose-600 bg-rose-500/10";
}

export function learningLevel(score: number) {
  if (score >= 90) return "Advanced";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Developing";
  return "Needs Support";
}

export function safeReadLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeWriteLocalStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function inferGradeSection(className?: string | null) {
  if (!className) return { grade: "Derived", section: "General" };

  const gradeMatch = className.match(/grade\s*\d+/i);
  const sectionMatch = className.match(/section\s*[a-z0-9]+/i);

  return {
    grade: gradeMatch?.[0] ?? className.split(/[-–—]/)[0]?.trim() ?? "Derived",
    section: sectionMatch?.[0] ?? className.split(/[-–—]/)[1]?.trim() ?? "General",
  };
}

export interface TherapySessionRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  duration: number;
  status: "today" | "upcoming" | "completed" | "cancelled";
  objectives: string[];
  activities: string[];
  notes: string;
  recommendations: string[];
  attachments: string[];
  mode: "in-person" | "online";
}

export interface TherapyAssessmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  status: "pending" | "completed";
  score: number;
  date: string;
  comparison: string;
  notes: string;
  chart: number[];
}

export interface TherapyRecommendationRecord {
  id: string;
  studentId: string;
  studentName: string;
  audience: "Teacher" | "Parent" | "Student" | "Institution";
  category: "Learning" | "Behavior" | "Communication" | "Motor Skills" | "Emotional" | "Social";
  priority: "Low" | "Medium" | "High";
  status: "Draft" | "Published" | "Archived";
  title: string;
  detail: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export function buildTherapySessionSeed<T extends { id: string; first_name?: string | null; last_name?: string | null }>(students: T[]): TherapySessionRecord[] {
  const selectedStudents = students.slice(0, 4);

  return selectedStudents.map((student, index) => {
    const studentName = getDisplayName(student, `Student ${index + 1}`);
    const dayOffset = index - 1;
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);

    return {
      id: `session-${student.id}-${index}`,
      studentId: student.id,
      studentName,
      date: date.toISOString(),
      time: ["09:30 AM", "11:00 AM", "02:00 PM", "03:30 PM"][index] ?? "10:00 AM",
      duration: [30, 45, 50, 40][index] ?? 45,
      status: index === 0 ? "today" : dayOffset > 0 ? "upcoming" : "completed",
      objectives: ["Regulation", "Task persistence", "Communication"].slice(0, 2 + (index % 2)),
      activities: ["Calm-start routine", "Structured play", "Visual schedule", "Reflection"].slice(0, 3),
      notes: "Therapy session seed generated from the available student list.",
      recommendations: ["Use visual cues", "Repeat instructions", "Offer short breaks"].slice(0, 2 + (index % 2)),
      attachments: [],
      mode: index % 2 === 0 ? "in-person" : "online",
    };
  });
}

export function buildTherapyAssessmentSeed<T extends { id: string; first_name?: string | null; last_name?: string | null }>(students: T[]): TherapyAssessmentRecord[] {
  const assessmentTypes = [
    "Learning Style Assessment",
    "Behavior Assessment",
    "Cognitive Assessment",
    "Communication Assessment",
    "Motor Skills Assessment",
    "Social Skills Assessment",
  ];

  return students.slice(0, assessmentTypes.length).map((student, index) => {
    const studentName = getDisplayName(student, `Student ${index + 1}`);
    const score = clampPercent(72 + (index * 5));

    return {
      id: `assessment-${student.id}-${index}`,
      studentId: student.id,
      studentName,
      type: assessmentTypes[index],
      status: index % 3 === 0 ? "pending" : "completed",
      score,
      date: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
      comparison: index % 2 === 0 ? "+8% vs baseline" : "+3% vs baseline",
      notes: "Generated from current progress and attendance trends.",
      chart: [48 + index * 2, 56 + index * 2, 62 + index * 2, 68 + index * 2, 72 + index * 2],
    };
  });
}

export function buildTherapyRecommendationSeed<T extends { id: string; first_name?: string | null; last_name?: string | null }>(students: T[]): TherapyRecommendationRecord[] {
  const categories: TherapyRecommendationRecord["category"][] = ["Learning", "Behavior", "Communication", "Motor Skills", "Emotional", "Social"];
  const audiences: TherapyRecommendationRecord["audience"][] = ["Teacher", "Parent", "Student", "Institution"];

  return students.slice(0, 4).map((student, index) => {
    const studentName = getDisplayName(student, `Student ${index + 1}`);
    const category = categories[index % categories.length];
    const audience = audiences[index % audiences.length];
    const now = new Date();

    return {
      id: `recommendation-${student.id}-${index}`,
      studentId: student.id,
      studentName,
      audience,
      category,
      priority: index % 3 === 0 ? "High" : index % 3 === 1 ? "Medium" : "Low",
      status: index % 2 === 0 ? "Published" : "Draft",
      title: `${category} support plan for ${studentName}`,
      detail: `Focus on ${category.toLowerCase()} strategies tailored to current performance trends.`,
      action: "Provide short, consistent follow-up at home and in class.",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  });
}
