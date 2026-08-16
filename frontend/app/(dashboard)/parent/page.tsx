"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents, useProgress, useAttendance, useAssignments, useQuizzes, useSubmissions, useLessons } from "@/hooks/useSchool";
import { useNotifications, useReports } from "@/hooks/usePlatform";
import { PageHeader } from "@/components/common/AdminUI";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  GraduationCap,
  TrendingUp,
  ClipboardCheck,
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  BrainCircuit,
  Users,
  CalendarDays,
  BookOpen,
  FileText,
  Bell,
  Clock3,
} from "lucide-react";
import { flattenInfinitePages, average, formatDateValue, getDisplayName, getInitials, learningLevel, scoreTone } from "@/lib/parent";

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const firstName = user?.firstName || "Parent";
  const { data: studentsData, isLoading: studentsLoading } = useStudents(100);
  const { data: progressData, isLoading: progressLoading } = useProgress();
  const { data: assignmentsData } = useAssignments();
  const { data: quizzesData } = useQuizzes();
  const { data: submissionsData } = useSubmissions();
  const { data: lessonsData } = useLessons();
  const { data: notificationsData } = useNotifications();
  const { data: reportsData } = useReports();

  const [selectedChildId, setSelectedChildId] = useState("");

  const children = flattenInfinitePages(studentsData);
  const progressRecords = flattenInfinitePages(progressData);
  const assignments = flattenInfinitePages(assignmentsData);
  const quizzes = flattenInfinitePages(quizzesData);
  const submissions = flattenInfinitePages(submissionsData);
  const lessons = flattenInfinitePages(lessonsData);
  const notifications = notificationsData?.data ?? [];
  const reports = reportsData?.data ?? [];

  useEffect(() => {
    if (!selectedChildId && children[0]?.id) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children.find((child) => child.id === selectedChildId) ?? children[0];
  const childProgress = selectedChild ? progressRecords.filter((entry) => entry.student_id === selectedChild.id) : progressRecords;
  const childSubmissions = selectedChild ? submissions.filter((entry) => entry.student_id === selectedChild.id) : submissions;
  const childAssignments = assignments.filter((assignment) => childSubmissions.some((submission) => submission.assignment_id === assignment.id));
  const childQuizzes = quizzes.filter((quiz) => childSubmissions.some((submission) => submission.quiz_id === quiz.id));

  const avgProgress = average(childProgress.map((entry) => (entry as any).completion_percentage ?? 100));
  const completedLessons = new Set(childProgress.map((entry) => entry.lesson_id)).size;
  const upcomingAssignments = assignments.filter((assignment) => !assignment.due_date || new Date(assignment.due_date) >= new Date()).slice(0, 4);
  const upcomingQuizzes = quizzes.filter((quiz) => !quiz.due_date || new Date(quiz.due_date) >= new Date()).slice(0, 4);
  const recentGrades = [...childProgress].sort((a, b) => new Date((b as any).updated_at).getTime() - new Date((a as any).updated_at).getTime()).slice(0, 6);
  const teacherMessages = notifications.filter((notification) => /teacher|class|lesson|quiz|assignment|progress/i.test(`${notification.title} ${notification.message}`)).slice(0, 4);
  const schoolAnnouncements = notifications.filter((notification) => /school|holiday|conference|report|event|announcement/i.test(`${notification.title} ${notification.message}`)).slice(0, 4);

  const weeklyTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      const dayKey = format(day, "yyyy-MM-dd");
      const dayProgress = childProgress.filter((entry) => format(new Date((entry as any).updated_at), "yyyy-MM-dd") === dayKey).map((entry) => (entry as any).completion_percentage ?? 100);
      return {
        label: format(day, "EEE"),
        score: average(dayProgress),
      };
    });
  }, [childProgress]);

  const activity = [
    ...recentGrades.map((entry) => ({
      id: entry.id,
      icon: CheckCircle,
      title: `${selectedChild ? getDisplayName(selectedChild) : "Child"} scored ${(entry as any).completion_percentage ?? 100}%`,
      detail: lessons.find((lesson) => lesson.id === entry.lesson_id)?.title ?? "Completed a lesson",
      time: formatDateValue((entry as any).updated_at, "MMM d, p"),
    })),
  ].sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime()).slice(0, 8);

  const stats = [
    { title: "Children enrolled", value: children.length, icon: <GraduationCap className="h-4 w-4" />, accentColor: "bg-rose-500/10 text-rose-600", loading: studentsLoading },
    { title: "Avg progress score", value: `${avgProgress}%`, icon: <TrendingUp className="h-4 w-4" />, accentColor: "bg-emerald-500/10 text-emerald-600", loading: progressLoading },
    { title: "Unread messages", value: notifications.filter((notification) => !notification.is_read).length, icon: <MessageSquare className="h-4 w-4" />, accentColor: "bg-violet-500/10 text-violet-600", loading: false },
  ];

  if (!children.length) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600/10 via-rose-500/5 to-background border p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-heading">Good morning, {firstName}</h1>
            <p className="text-muted-foreground mt-2 max-w-lg text-sm">No authorized child records are currently visible to this parent account.</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">The dashboard is connected to the backend and will populate once linked students are returned for this account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600/10 via-rose-500/5 to-background border p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(244,63,94,0.18),_transparent_35%)]" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold font-heading">Good morning, {firstName}</h1>
              <p className="text-muted-foreground mt-2 max-w-lg text-sm">Here's today's overview across the children linked to your account.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/parent/messages"><Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" /> Messages</Button></Link>
              <Link href="/parent/progress"><Button className="gap-2 bg-rose-600 hover:bg-rose-700 text-white border-none"><TrendingUp className="h-4 w-4" /> Progress</Button></Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {children.slice(0, 5).map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all ${selectedChild?.id === child.id ? "bg-foreground text-background" : "bg-background/70 hover:bg-muted"}`}
              >
                <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-rose-500/10 text-rose-600">{getInitials(child)}</AvatarFallback></Avatar>
                <span>{getDisplayName(child)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">{selectedChild ? getDisplayName(selectedChild) : "Child"} summary</CardTitle>
              <CardDescription>{format(new Date(), "EEEE, MMMM do")}</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1.5"><Users className="h-3.5 w-3.5" /> {children.length} children</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Open assignments", value: childAssignments.length || upcomingAssignments.length },
              { label: "Quiz items", value: childQuizzes.length || upcomingQuizzes.length },
              { label: "Lessons completed", value: completedLessons },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{item.value}</p>
              </div>
            ))}

            <div className="sm:col-span-2 xl:col-span-4 rounded-2xl border bg-gradient-to-r from-rose-500/5 to-transparent p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div><p className="text-xs text-muted-foreground">Average score</p><p className="mt-1 text-2xl font-bold font-heading">{avgProgress}%</p></div>
                <div><p className="text-xs text-muted-foreground">Learning level</p><p className="mt-1 text-2xl font-bold font-heading">{learningLevel(avgProgress)}</p></div>
                <div><p className="text-xs text-muted-foreground">Score band</p><p className="mt-1 text-2xl font-bold font-heading capitalize">{scoreTone(avgProgress).replace("-", " ")}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-rose-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Clock3 className="h-4 w-4 text-rose-500" /> Upcoming tasks</CardTitle>
            <CardDescription>Assignments and quizzes coming due soon.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...upcomingAssignments.slice(0, 2).map((assignment) => ({
              id: assignment.id,
              title: assignment.title,
              detail: formatDateValue(assignment.due_date, "MMM d, p"),
              tone: "text-rose-600",
            })), ...upcomingQuizzes.slice(0, 2).map((quiz) => ({
              id: quiz.id,
              title: quiz.title,
              detail: formatDateValue(quiz.due_date, "MMM d, p"),
              tone: "text-violet-600",
            }))].slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border bg-background p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className={`mt-1 text-xs ${item.tone}`}>{item.detail}</p>
              </div>
            ))}
            {upcomingAssignments.length === 0 && upcomingQuizzes.length === 0 && (
              <div className="rounded-2xl border bg-background p-3 text-sm text-muted-foreground">No upcoming tasks right now.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent activity timeline</CardTitle>
            <CardDescription>Progress, attendance, and communication updates.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.length === 0 ? (
            <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">No recent activity to display.</div>
          ) : activity.map((entry, index) => (
            <motion.div
              key={`${entry.id}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 rounded-2xl border p-3 hover:bg-muted/40 transition-colors"
            >
              <div className="mt-0.5 rounded-full bg-rose-500/10 p-2 text-rose-600"><entry.icon className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{entry.title}</p>
                <p className="text-xs text-muted-foreground">{entry.detail}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{entry.time}</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
