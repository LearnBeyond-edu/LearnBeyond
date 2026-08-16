"use client";

import { use, useState } from "react";
import { ArrowLeft, GraduationCap, Mail, Calendar, TrendingUp, CheckSquare, FileText, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useStudent, useAttendance, useProgress, useParents, useDeleteParent, useSubmissions } from "@/hooks/useSchool";
import { PageHeader, ErrorState, TableSkeleton, EmptyState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Trash2 } from "lucide-react";
import { AddStaffDialog } from "@/components/school/AddStaffDialog";
import { useAuthStore } from "@/store/useAuthStore";

export default function TeacherStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const { data: student, isLoading: isStudentLoading, isError: isStudentError, refetch } = useStudent(id);
  const { data: progressData } = useProgress({ student_id: id });
  const { data: submissionsData } = useSubmissions({ student_id: id }, 100);
  const { data: parentsData } = useParents(50);
  const { mutate: deleteParent, isPending: isDeletingParent } = useDeleteParent();
  const { user } = useAuthStore();

  if (isStudentError) return <ErrorState error="Student not found" onRetry={refetch} />;
  if (isStudentLoading) return <TableSkeleton rows={5} cols={2} />;
  if (!student) return <ErrorState error="Student data not available" onRetry={refetch} />;

  const allProgress = progressData?.pages.flatMap((p: any) => p.data) ?? [];
  const allSubmissions = submissionsData?.pages.flatMap((p: any) => p.data) ?? [];
  const allParents = parentsData?.pages.flatMap((p: any) => p.data) ?? [];

  const studentProgress = allProgress; // Already filtered by hook
  const studentParents = allParents.filter((p: any) => p.student_id === student.user_id);

  const quizSubmissions = allSubmissions.filter((s: any) => s.assessment_type === "quiz");
  const assignmentSubmissions = allSubmissions.filter((s: any) => s.assessment_type !== "quiz");
  const avgQuizScore = quizSubmissions.length > 0 
      ? Math.round(quizSubmissions.reduce((acc: any, curr: any) => acc + (curr.score || 0), 0) / quizSubmissions.length)
      : 0;

  const fullName = [student.first_name, student.last_name].filter(Boolean).join(" ") || `Student ${id.slice(0, 6)}`;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3 mb-[-10px]">
        <Link href="/teacher/students">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title={fullName} subtitle="Student Profile & Academic Record" />
      </div>

      {/* Profile Header Card */}
      <Card className="border-border/60 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-background">
              <AvatarFallback className="text-2xl font-bold bg-emerald-500/10 text-emerald-600">
                {(student.first_name?.[0] ?? "S").toUpperCase()}{(student.last_name?.[0] ?? "").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {[
                { icon: <GraduationCap className="h-4 w-4" />, label: "Full Name", value: fullName },
                { icon: <Mail className="h-4 w-4" />, label: "Student ID", value: student.id.slice(0, 8).toUpperCase() },
                { icon: <Calendar className="h-4 w-4" />, label: "Enrolled", value: format(new Date(student.created_at), "MMM yyyy") },
                { icon: <BrainCircuit className="h-4 w-4" />, label: "Learning Style", value: "Visual-Kinesthetic" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex flex-col gap-1 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                    {icon} {label}
                  </div>
                  <div className="font-semibold text-sm truncate">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Lessons Completed", value: studentProgress.length, color: "text-blue-500" },
          { label: "Assignments Done", value: assignmentSubmissions.length, color: "text-violet-500" },
          { label: "Average Quiz Score", value: `${avgQuizScore}%`, color: "text-orange-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6 inline-flex flex-wrap h-auto">
          <TabsTrigger value="progress" className="gap-2"><TrendingUp className="h-4 w-4" /> Academic Progress</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><FileText className="h-4 w-4" /> Assignments</TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-2"><CheckSquare className="h-4 w-4" /> Quiz Results</TabsTrigger>
          <TabsTrigger value="notes" className="gap-2"><BrainCircuit className="h-4 w-4" /> Behavior & Notes</TabsTrigger>
          <TabsTrigger value="parents" className="gap-2"><Users className="h-4 w-4" /> Parents</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-0 outline-none">
          <Card>
            <CardHeader><CardTitle className="text-base">Lesson Progress</CardTitle></CardHeader>
            <CardContent>
              {studentProgress.length === 0 ? (
                <EmptyState icon={<TrendingUp className="h-10 w-10" />} title="No progress data" description="Student has not started any tracked lessons." />
              ) : (
                <div className="space-y-3">
                  {studentProgress.map((prog) => (
                    <div key={prog.id} className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${prog.status === "completed" ? "bg-green-500 shadow-green-500/20" : prog.status === "in_progress" ? "bg-yellow-500 shadow-yellow-500/20" : "bg-muted"}`} />
                        <div>
                          <p className="text-sm font-semibold font-mono">Lesson {prog.lesson_id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(prog.updated_at), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {prog.completion_percentage !== null && <span className="text-sm font-bold">{prog.completion_percentage}%</span>}
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${prog.status === "completed" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"}`}>
                          {prog.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-0 outline-none">
          <Card>
            <CardContent className="p-6">
              {assignmentSubmissions.length === 0 ? (
                <EmptyState icon={<FileText className="h-10 w-10" />} title="No assignments submitted" description="Student has not submitted any assignments yet." />
              ) : (
                <div className="space-y-3">
                  {assignmentSubmissions.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm bg-violet-500 shadow-violet-500/20" />
                        <div>
                          <p className="text-sm font-semibold font-mono">Assignment {sub.assessment_id?.slice(0, 8) || sub.assignment_id?.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(sub.created_at), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-violet-500">{sub.status || "Submitted"}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="mt-0 outline-none">
          <Card>
            <CardContent className="p-6">
              {quizSubmissions.length === 0 ? (
                <EmptyState icon={<CheckSquare className="h-10 w-10" />} title="No quiz results" description="Student has not completed any quizzes yet." />
              ) : (
                <div className="space-y-3">
                  {quizSubmissions.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm bg-orange-500 shadow-orange-500/20" />
                        <div>
                          <p className="text-sm font-semibold font-mono">Quiz {sub.assessment_id?.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(sub.created_at), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold">{sub.score}%</span>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-orange-500/10 text-orange-700 dark:text-orange-400">
                          {sub.status || "Graded"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-0 outline-none">
          <Card>
            <CardContent className="p-6">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Laura AI Observation</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {student.first_name} shows high engagement during visual-spatial tasks. 
                  Attention occasionally wanes during extended reading periods. 
                  Recommendation: Incorporate more diagrammatic representations in assignments.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parents" className="mt-0 outline-none">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-base">Linked Parents</CardTitle>
              <AddStaffDialog role="Parent" institutionId={user?.institutionId || ""} studentId={student.user_id} />
            </CardHeader>
            <CardContent className="pt-6">
              {studentParents.length === 0 ? (
                <EmptyState icon={<Users className="h-10 w-10" />} title="No parents linked" description="No parents have been added for this student yet." />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {studentParents.map((parent) => (
                    <div key={parent.id} className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg font-bold bg-violet-500/10 text-violet-600">
                          {(parent.first_name?.[0] ?? "P").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{[parent.first_name, parent.last_name].filter(Boolean).join(" ") || "Parent"}</p>
                        <p className="text-xs text-muted-foreground">Relation: {parent.relation || "Parent"}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" disabled={isDeletingParent} onClick={() => deleteParent(parent.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
