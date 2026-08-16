import { format } from "date-fns";

export type NameLike = {
  first_name?: string | null;
  last_name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
};

type InfiniteDataLike<T> = {
  pages?: Array<{ data: T[] }>;
} | null | undefined;

export function flattenInfinitePages<T>(data?: InfiniteDataLike<T>): T[] {
  return data?.pages?.flatMap((page) => page.data) ?? [];
}

export function getDisplayName(person?: NameLike | null): string {
  if (!person) return "Unknown";

  const first = person.first_name ?? person.firstName ?? "";
  const last = person.last_name ?? person.lastName ?? "";
  const full = `${first} ${last}`.trim();

  if (full) return full;
  if (person.name) return person.name;
  if (person.email) return person.email;

  return "Unknown";
}

export function getInitials(person?: NameLike | null): string {
  if (!person) return "LB";

  const first = person.first_name ?? person.firstName ?? person.name?.split(" ")[0] ?? "";
  const last = person.last_name ?? person.lastName ?? person.name?.split(" ")[1] ?? "";

  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "LB";
}

export function formatDateValue(value?: string | null, pattern = "MMM d, yyyy"): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return format(date, pattern);
}

export function scoreTone(score?: number | null): string {
  if (score === null || score === undefined) return "neutral";
  if (score >= 90) return "excellent";
  if (score >= 80) return "strong";
  if (score >= 70) return "steady";
  return "needs-attention";
}

export function learningLevel(score?: number | null): string {
  if (score === null || score === undefined) return "Emerging";
  if (score >= 90) return "Advanced";
  if (score >= 80) return "On Track";
  if (score >= 70) return "Developing";
  return "Needs Support";
}

export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function average(values: Array<number | null | undefined>): number {
  const valid = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (valid.length === 0) return 0;
  return clampPercent(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}
