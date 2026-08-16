"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, GraduationCap, Phone, Mail, Calendar, TrendingUp, ClipboardCheck, BookOpen } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useStudent, useAttendance, useProgress, useAssignments } from "@/hooks/useSchool";
import { PageHeader, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading, isError } = useStudent(id);
  const { data: attendanceData } = useAttendance();
  const { data: progressData } = useProgress();

  const allAttendance = attendanceData?.pages.flatMap((p) => p.data) ?? [];
  const allProgress = progressData?.pages.flatMap((p) => p.data) ?? [];

  const studentAttendance = allAttendance.filter((a) => a.student_id === id);
  const studentProgress = allProgress.filter((p) => p.student_id === id);
  const presentCount = studentAttendance.filter((a) => a.status === "present").length;
  const attendanceRate = studentAttendance.length > 0
    ? Math.round((presentCount / studentAttendance.length) * 100) : 0;

  const fullName = student
    ? [student.first_name, student.last_name].filter(Boolean).join(" ") || `Student ${id.slice(0, 6)}`
    : "";

  if (isError) return <ErrorState error="Student not found" />;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/school/students">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        {isLoading ? <Skeleton className="h-7 w-40" /> : <PageHeader title={fullName} subtitle="Student Profile" />}
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : (
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl font-bold bg-green-500/20 text-green-600">
                  {(student?.first_name?.[0] ?? "S").toUpperCase()}{(student?.last_name?.[0] ?? "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: <GraduationCap className="h-4 w-4" />, label: "Full Name", value: fullName },
                  { icon: <Mail className="h-4 w-4" />, label: "User ID", value: (student?.user_id.slice(0, 16) ?? "") + "…" },
                  { icon: <Calendar className="h-4 w-4" />, label: "Enrolled", value: student?.created_at ? format(new Date(student.created_at), "PPP") : "—" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl border bg-muted/30">
                    <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Attendance Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{studentAttendance.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sessions Recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{studentProgress.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Lessons Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Records */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Learning Progress</CardTitle></CardHeader>
        <CardContent>
          {studentProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No progress records yet.</p>
          ) : (
            <div className="space-y-2">
              {studentProgress.slice(0, 8).map((prog) => (
                <div key={prog.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${prog.status === "completed" ? "bg-green-500" : prog.status === "in_progress" ? "bg-yellow-500" : "bg-muted"}`} />
                    <span className="text-sm font-mono">{prog.lesson_id.slice(0, 12)}…</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {prog.score !== null && (
                      <span className="text-sm font-bold">{prog.score}%</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${prog.status === "completed" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                      {prog.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
