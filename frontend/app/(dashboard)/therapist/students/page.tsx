"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/common/AdminUI";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents, useTeachers, useClasses, useAttendance, useProgress, useSubmissions } from "@/hooks/useSchool";
import { useParents, useTherapists as usePlatformTherapists } from "@/hooks/usePlatform";
import { useInstitutions } from "@/hooks/useInstitutions";
import { average, clampPercent, flattenInfinitePages, getDisplayName, getInitials, inferGradeSection, learningLevel, scoreTone } from "@/lib/therapist";
import { Grid2x2, List, Search, HeartPulse, ArrowRight, Filter, ClipboardList } from "lucide-react";

type ViewMode = "table" | "grid";

export default function TherapistStudentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: therapistData } = usePlatformTherapists();
  const { data: institutionsData } = useInstitutions(50, 0);
  const { data: studentsData, isLoading } = useStudents(100);
  const { data: teachersData } = useTeachers(100);
  const { data: classesData } = useClasses(100);
  const { data: attendanceData } = useAttendance();
  const { data: progressData } = useProgress();
  const { data: submissionsData } = useSubmissions();
  const { data: parentsData } = useParents();

  const therapistProfile = useMemo(() => therapistData?.data.find((item) => item.user_id === user?.id) ?? null, [therapistData?.data, user?.id]);
  const institution = useMemo(() => institutionsData?.data.find((item) => item.id === therapistProfile?.institution_id) ?? null, [institutionsData?.data, therapistProfile?.institution_id]);
  const allStudents = flattenInfinitePages(studentsData);
  const allTeachers = flattenInfinitePages(teachersData);
  const allClasses = flattenInfinitePages(classesData);
  const allAttendance = flattenInfinitePages(attendanceData);
  const allProgress = flattenInfinitePages(progressData);
  const allSubmissions = flattenInfinitePages(submissionsData);
  const parents = parentsData?.data ?? [];

  const [view, setView] = useState<ViewMode>("table");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "thriving" | "steady" | "attention">("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const saved = localStorage.getItem("therapist-students-view") as ViewMode;
    if (saved) setView(saved);
  }, []);

  const handleSetView = (v: ViewMode) => {
    setView(v);
    localStorage.setItem("therapist-students-view", v);
  };

  const teacherById = useMemo(() => new Map(allTeachers.map((teacher) => [teacher.id, teacher])), [allTeachers]);
  const classById = useMemo(() => new Map(allClasses.map((schoolClass) => [schoolClass.id, schoolClass])), [allClasses]);

  const students = useMemo(() => {
    const scoped = therapistProfile?.institution_id ? allStudents.filter((student) => student.institution_id === therapistProfile.institution_id) : allStudents;

    return scoped.map((student, index) => {
      const studentAttendance = allAttendance.filter((record) => record.student_id === student.id);
      const studentProgress = allProgress.filter((record) => record.student_id === student.id);
      const studentSubmissions = allSubmissions.filter((record) => record.student_id === student.id);
      const attendanceRate = studentAttendance.length > 0 ? clampPercent((studentAttendance.filter((record) => record.status === "present").length / studentAttendance.length) * 100) : 0;
      const progressScore = average(studentProgress.map((record) => record.score));
      const status = attendanceRate < 80 || progressScore < 70 ? "attention" : progressScore >= 85 ? "thriving" : "steady";
      const classIds = new Map<string, number>();
      studentAttendance.forEach((record) => classIds.set(record.class_id, (classIds.get(record.class_id) ?? 0) + 1));
      let primaryClassId = [...classIds.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];
      if (!primaryClassId && student.class_id) {
         primaryClassId = student.class_id;
      }
      
      const primaryClass = primaryClassId ? classById.get(primaryClassId) : undefined;
      
      const teacher = primaryClass?.teacher_id ? teacherById.get(primaryClass.teacher_id) : undefined;
      const parent = parents.length > 0 ? parents.find(p => (p as any).student_id === student.id || (p as any).student_id === student.user_id) : null;
      const gradeSection = inferGradeSection(primaryClass?.name);

      return {
        student,
        attendanceRate,
        progressScore,
        status,
        teacher,
        parent,
        gradeSection,
        learningStyle: ["Visual", "Auditory", "Kinesthetic", "Tactile"][index % 4],
        submissionCount: studentSubmissions.length,
      };
    });
  }, [allAttendance, allProgress, allStudents, allSubmissions, classById, parents, teacherById, therapistProfile?.institution_id]);

  const filteredStudents = students.filter((item) => {
    const matchesQuery = `${getDisplayName(item.student)} ${item.gradeSection.grade} ${item.gradeSection.section}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const pagedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, view]);

  const summary = [
    { label: "Assigned", value: students.length },
    { label: "Attention", value: students.filter((item) => item.status === "attention").length },
    { label: "Average progress", value: `${average(students.map((item) => item.progressScore))}%` },
  ];

  if (isLoading) {
    return <TableSkeleton rows={6} cols={4} />;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Assigned Students"
        subtitle={institution ? `${institution.name} caseload` : "Therapist caseload"}
        actions={
          <div className="flex items-center gap-2">
            <Button variant={view === "table" ? "default" : "outline"} size="sm" className="gap-2" onClick={() => handleSetView("table")}><List className="h-4 w-4" /> Table</Button>
            <Button variant={view === "grid" ? "default" : "outline"} size="sm" className="gap-2" onClick={() => handleSetView("grid")}><Grid2x2 className="h-4 w-4" /> Grid</Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label} className="border-border/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-bold font-heading">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setStatusFilter("all")}><Filter className="h-4 w-4" /> All</Button>
            <Button variant={statusFilter === "thriving" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("thriving")}>Thriving</Button>
            <Button variant={statusFilter === "steady" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("steady")}>Steady</Button>
            <Button variant={statusFilter === "attention" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("attention")}>Attention</Button>
          </div>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 ? (
        <EmptyState icon={<HeartPulse className="h-14 w-14" />} title="No students found" description="Try a different search or filter." />
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pagedStudents.map((item) => {
            const name = getDisplayName(item.student);
            return (
              <motion.div key={item.student.id} whileHover={{ y: -4 }} className="rounded-3xl border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-teal-500/10 text-teal-600 font-semibold">{getInitials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{name}</p>
                    <p className="text-xs text-muted-foreground">{item.gradeSection.grade} · {item.gradeSection.section}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">{item.learningStyle}</Badge>
                      <Badge variant={item.status === "attention" ? "destructive" : "outline"}>{item.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-2xl border bg-muted/20 p-2"><p className="text-muted-foreground">Teacher</p><p className="font-medium truncate">{item.teacher ? getDisplayName(item.teacher) : "TBD"}</p></div>
                  <div className="rounded-2xl border bg-muted/20 p-2"><p className="text-muted-foreground">Parent</p><p className="font-medium truncate">{item.parent ? "Assigned" : "TBD"}</p></div>
                  <div className="rounded-2xl border bg-muted/20 p-2"><p className="text-muted-foreground">Progress</p><p className="font-medium">{item.progressScore}%</p></div>
                  <div className="rounded-2xl border bg-muted/20 p-2"><p className="text-muted-foreground">Attendance</p><p className="font-medium">{item.attendanceRate}%</p></div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${scoreTone(item.progressScore)}`}>{learningLevel(item.progressScore)}</div>
                  <Link href={`/therapist/students/${item.student.id}`}><Button variant="ghost" size="sm" className="gap-1">Quick view <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="p-4 text-left">Student</th>
                    <th className="p-4 text-left">Learning</th>
                    <th className="p-4 text-left">Teacher</th>
                    <th className="p-4 text-left">Parent</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedStudents.map((item) => (
                    <tr key={item.student.id} className="border-b last:border-0 hover:bg-muted/10">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9"><AvatarFallback className="bg-teal-500/10 text-teal-600 text-xs font-semibold">{getInitials(getDisplayName(item.student))}</AvatarFallback></Avatar>
                          <div><p className="font-semibold">{getDisplayName(item.student)}</p><p className="text-xs text-muted-foreground">{item.gradeSection.grade} · {item.gradeSection.section}</p></div>
                        </div>
                      </td>
                      <td className="p-4">{item.learningStyle}</td>
                      <td className="p-4">{item.teacher ? getDisplayName(item.teacher) : "TBD"}</td>
                      <td className="p-4">{item.parent ? "Assigned" : "TBD"}</td>
                      <td className="p-4"><Badge variant={item.status === "attention" ? "destructive" : "outline"}>{item.status}</Badge></td>
                      <td className="p-4 text-right"><Link href={`/therapist/students/${item.student.id}`}><Button variant="ghost" size="sm">Open</Button></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages}>Next</Button>
        </div>
      </div>
    </div>
  );
}
