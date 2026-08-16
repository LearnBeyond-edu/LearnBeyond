"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStudents, useProgress, useAttendance, useAssignments, useQuizzes, useSubmissions } from "@/hooks/useSchool";
import { PageHeader, EmptyState } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, TrendingUp, ClipboardCheck, ArrowRight, Sparkles, Award, Flame } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { flattenInfinitePages, getDisplayName, getInitials, average, learningLevel, scoreTone } from "@/lib/parent";

export default function ParentChildrenPage() {
  const { data: studentsData, isLoading } = useStudents(100);
  const { data: progressData } = useProgress();
  const { data: attendanceData } = useAttendance();
  const [query, setQuery] = useState("");

  const students = flattenInfinitePages(studentsData);
  const progress = flattenInfinitePages(progressData);
  const attendance = flattenInfinitePages(attendanceData);

  const { data: assignmentsData } = useAssignments();
  const { data: quizzesData } = useQuizzes();
  const { data: submissionsData } = useSubmissions();
  const assignments = flattenInfinitePages(assignmentsData);
  const quizzes = flattenInfinitePages(quizzesData);
  const submissions = flattenInfinitePages(submissionsData);

  const children = useMemo(() => {
    return students
      .filter((child) => getDisplayName(child).toLowerCase().includes(query.toLowerCase()))
      .map((child) => {
        const childProgress = progress.filter((entry) => entry.student_id === child.id);
        const childAttendance = attendance.filter((entry) => entry.student_id === child.id);
        const childSubmissions = submissions.filter((entry) => entry.student_id === child.id);

        const classIds = new Map<string, number>();
        childAttendance.forEach((record) => classIds.set(record.class_id, (classIds.get(record.class_id) ?? 0) + 1));
        let primaryClassId = [...classIds.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];
        if (!primaryClassId && child.class_id) primaryClassId = child.class_id;

        const childAssignments = assignments.filter((assignment) => assignment.class_id === primaryClassId || childSubmissions.some((s) => s.assignment_id === assignment.id || (s as any).assessment_id === assignment.id));
        const childQuizzes = quizzes.filter((quiz) => quiz.class_id === primaryClassId || childSubmissions.some((s) => s.quiz_id === quiz.id || (s as any).assessment_id === quiz.id));

        const score = average(childProgress.map((entry) => entry.score));
        const attendanceRate = childAttendance.length ? Math.round((childAttendance.filter((entry) => entry.status === "present").length / childAttendance.length) * 100) : 0;
        
        const finishedAssignments = childAssignments.filter(a => childSubmissions.some(s => (s.assignment_id === a.id || (s as any).assessment_id === a.id) && s.status === 'graded')).length;
        const finishedQuizzes = childQuizzes.filter(q => childSubmissions.some(s => (s.quiz_id === q.id || (s as any).assessment_id === q.id) && s.status === 'graded')).length;

        return {
          ...child,
          score,
          attendanceRate,
          streak: Math.max(1, childProgress.filter((entry) => entry.status === "completed").length),
          level: learningLevel(score),
          achievements: [
            score >= 90 ? "Honor roll" : null,
            attendanceRate >= 95 ? "Perfect attendance" : null,
            childProgress.length >= 5 ? "Momentum badge" : null,
          ].filter(Boolean) as string[],
          openTasks: childAssignments.length + childQuizzes.length - (finishedAssignments + finishedQuizzes),
          finishedTasks: finishedAssignments + finishedQuizzes,
        };
      });
  }, [attendance, progress, query, students, assignments, quizzes, submissions]);

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="My Children"
        subtitle="Authorized student profiles, performance, attendance, and quick open access"
        actions={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search children"
            className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((index) => <Skeleton key={index} className="h-56 rounded-2xl" />)}
        </div>
      ) : children.length === 0 ? (
        <EmptyState icon={<GraduationCap className="h-14 w-14" />} title="No children linked" description="The backend has not returned any authorized student records for this parent account." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id} className="overflow-hidden border-border/60 hover:shadow-lg transition-all duration-300">
              <div className="h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-orange-300" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border shadow-sm">
                      <AvatarFallback className="text-base font-bold bg-rose-500/10 text-rose-600">{getInitials(child)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg font-heading">{getDisplayName(child)}</h3>
                      <p className="text-xs text-muted-foreground">Authorized child profile</p>
                    </div>
                  </div>
                  <div className="rounded-full border bg-background px-3 py-1 text-xs font-semibold">{child.level}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border bg-emerald-500/10 p-3">
                    <p className="text-xs text-muted-foreground">Average score</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">{child.score}%</p>
                  </div>
                  <div className="rounded-2xl border bg-blue-500/10 p-3">
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className="mt-1 text-2xl font-bold text-blue-600">{child.attendanceRate}%</p>
                  </div>
                  <div className="rounded-2xl border bg-violet-500/10 p-3">
                    <p className="text-xs text-muted-foreground">Open tasks</p>
                    <p className="mt-1 text-2xl font-bold text-violet-600">{child.openTasks}</p>
                  </div>
                  <div className="rounded-2xl border bg-amber-500/10 p-3">
                    <p className="text-xs text-muted-foreground">Completed tasks</p>
                    <p className="mt-1 text-2xl font-bold text-amber-600">{child.finishedTasks}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> {scoreTone(child.score).replace("-", " ")}</Badge>
                  {child.achievements.slice(0, 2).map((achievement) => <Badge key={achievement} variant="outline" className="gap-1.5"><Award className="h-3.5 w-3.5" /> {achievement}</Badge>)}
                </div>

                <div className="flex gap-2 pt-1">
                  <Link href={`/parent/children/${child.id}`} className="flex-1">
                    <Button className="w-full gap-1.5 bg-rose-600 hover:bg-rose-700 text-white border-none">
                      <ArrowRight className="h-3.5 w-3.5" /> Quick Open
                    </Button>
                  </Link>
                  <Link href="/parent/progress" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      <TrendingUp className="h-3.5 w-3.5" /> Progress
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
