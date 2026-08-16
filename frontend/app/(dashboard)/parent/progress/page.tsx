"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useProgress, useStudents, useLessons, useAssignments, useQuizzes, useSubmissions } from "@/hooks/useSchool";
import { PageHeader, EmptyState } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BookOpen, CheckCircle, GraduationCap, Sparkles, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { flattenInfinitePages, average, getDisplayName, learningLevel, scoreTone } from "@/lib/parent";

export default function ParentProgressPage() {
  const { data: progressData, isLoading: progressLoading } = useProgress();
  const { data: studentsData } = useStudents(100);
  const { data: lessonsData } = useLessons(50);
  const { data: assignmentsData } = useAssignments();
  const { data: quizzesData } = useQuizzes();
  const { data: submissionsData } = useSubmissions();
  const [selectedChildId, setSelectedChildId] = useState("");

  const progress = flattenInfinitePages(progressData);
  const students = flattenInfinitePages(studentsData);
  const lessons = flattenInfinitePages(lessonsData);
  const assignments = flattenInfinitePages(assignmentsData);
  const quizzes = flattenInfinitePages(quizzesData);
  const submissions = flattenInfinitePages(submissionsData);

  useEffect(() => {
    if (!selectedChildId && students[0]?.id) setSelectedChildId(students[0].id);
  }, [selectedChildId, students]);

  const selectedChild = students.find((child) => child.id === selectedChildId) ?? students[0];
  const selectedProgress = selectedChild ? progress.filter((entry) => entry.student_id === selectedChild.id) : progress;
  const selectedSubmissions = selectedChild ? submissions.filter((entry) => entry.student_id === selectedChild.id) : submissions;
  const avgScore = average(selectedProgress.map((entry) => (entry as any).completion_percentage ?? 100));
  const completedCount = selectedProgress.filter((entry) => entry.status === "completed").length;
  const lessonCount = new Set(selectedProgress.map((entry) => entry.lesson_id)).size;

  const subjectPerformance = useMemo(() => {
    const grouped = selectedProgress.reduce<Record<string, number[]>>((acc, entry) => {
      const title = lessons.find((lesson) => lesson.id === entry.lesson_id)?.title ?? "Learning module";
      const subject = title.split(/[–:-]/)[0].trim() || "Learning module";
      acc[subject] = acc[subject] ?? [];
      acc[subject].push((entry as any).completion_percentage ?? 100);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([subject, scores]) => ({ subject, score: average(scores), count: scores.length }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 6);
  }, [lessons, selectedProgress]);

  const weeklyTrend = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const dayKey = format(day, "yyyy-MM-dd");
    const scores = selectedProgress.filter((entry) => format(new Date((entry as any).updated_at), "yyyy-MM-dd") === dayKey).map((entry) => (entry as any).completion_percentage ?? 100);
    return { label: format(day, "EEE"), score: average(scores) };
  }), [selectedProgress]);

  const monthlyTrend = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - index));
    const monthKey = format(month, "yyyy-MM");
    const scores = selectedProgress.filter((entry) => format(new Date((entry as any).updated_at), "yyyy-MM") === monthKey).map((entry) => (entry as any).completion_percentage ?? 100);
    return { label: format(month, "MMM"), score: average(scores) };
  }), [selectedProgress]);

  const insights = [
    avgScore >= 90 ? "Strong performance across recent lessons." : avgScore >= 80 ? "Steady progress with opportunities for reinforcement." : "This child benefits from targeted practice and review.",
    selectedSubmissions.length > 0 ? `${selectedSubmissions.length} recent submissions are available for review.` : "No submissions have been recorded yet.",
    students.length > 1 ? "Use the child selector to compare sibling progress patterns." : "Single-child view keeps the focus on one learning path.",
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Academic Progress"
        subtitle="Overall progress, subject trends, completed modules, and learning insights"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {students.slice(0, 5).map((child) => (
              <Button key={child.id} variant={selectedChild?.id === child.id ? "default" : "outline"} size="sm" onClick={() => setSelectedChildId(child.id)}>
                {getDisplayName(child)}
              </Button>
            ))}
          </div>
        }
      />

      {!students.length ? (
        <EmptyState icon={<GraduationCap className="h-14 w-14" />} title="No academic data" description="The backend has not returned any authorized child records for this account yet." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Average score", value: `${avgScore}%`, icon: BarChart3, tone: "text-emerald-600" },
              { label: "Completed lessons", value: completedCount, icon: CheckCircle, tone: "text-blue-600" },
              { label: "Modules completed", value: lessonCount, icon: BookOpen, tone: "text-violet-600" },
              { label: "Learning level", value: learningLevel(avgScore), icon: Sparkles, tone: "text-rose-600" },
            ].map((item) => (
              <Card key={item.label} className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <item.icon className={`h-4 w-4 ${item.tone}`} />
                  </div>
                  <p className={`mt-3 text-3xl font-bold font-heading ${item.tone}`}>{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Subject performance</CardTitle>
                <CardDescription>{selectedChild ? `Performance for ${getDisplayName(selectedChild)}` : "Performance across linked children"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjectPerformance.length === 0 ? (
                  <EmptyState icon={<BookOpen className="h-10 w-10" />} title="No subject data yet" description="Subject performance appears after lessons are completed." />
                ) : subjectPerformance.map((item) => (
                  <div key={item.subject} className="space-y-2 rounded-2xl border p-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{item.subject}</span>
                      <span className="text-muted-foreground">{item.count} records</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-orange-300" style={{ width: `${item.score}%` }} /></div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{scoreTone(item.score).replace("-", " ")}</span><span className="font-medium text-foreground">{item.score}%</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-rose-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-base">Learning insights</CardTitle>
                <CardDescription>Quick guidance based on current progress data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {insights.map((item) => <div key={item} className="rounded-2xl border bg-background p-3 leading-relaxed">{item}</div>)}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Weekly trend</CardTitle>
                <CardDescription>Rolling seven-day view of recent scores.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-7 gap-2">
                  {weeklyTrend.map((item) => (
                    <div key={item.label} className="rounded-2xl border p-3 text-center">
                      <div className="flex h-28 items-end"><div className="w-full rounded-full bg-emerald-500/20" style={{ height: `${Math.max(20, item.score)}%` }} /></div>
                      <p className="mt-2 text-[10px] font-semibold uppercase text-muted-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.score}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Monthly trend</CardTitle>
                <CardDescription>Performance across the last six months.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-6 gap-2">
                  {monthlyTrend.map((item) => (
                    <div key={item.label} className="rounded-2xl border p-3 text-center">
                      <div className="flex h-28 items-end"><div className="w-full rounded-full bg-rose-500/20" style={{ height: `${Math.max(20, item.score)}%` }} /></div>
                      <p className="mt-2 text-[10px] font-semibold uppercase text-muted-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.score}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Lesson completion</CardTitle>
              <CardDescription>{selectedChild ? `${getDisplayName(selectedChild)} has ${selectedProgress.length} progress records.` : "Progress records across linked children."}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {progressLoading ? (
                <div className="p-6 space-y-3">{[1,2,3].map((index) => <Skeleton key={index} className="h-12 w-full" />)}</div>
              ) : selectedProgress.length === 0 ? (
                <div className="p-8"><EmptyState icon={<TrendingUp className="h-10 w-10" />} title="No progress records yet" description="Progress will appear as lessons are completed." /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        <th className="text-left p-4 font-semibold text-muted-foreground">Lesson</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Score</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProgress.slice(0, 20).map((record) => {
                        const lesson = lessons.find((item) => item.id === record.lesson_id);
                        return (
                          <tr key={record.id} className="border-b last:border-0 hover:bg-muted/10">
                            <td className="p-4 font-medium">{lesson?.title ?? "Unknown Lesson"}</td>
                            <td className="p-4"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${record.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : record.status === "in_progress" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`}>{record.status}</span></td>
                            <td className="p-4 font-semibold text-emerald-600">{(record as any).completion_percentage !== null ? `${(record as any).completion_percentage}%` : "—"}</td>
                            <td className="p-4 text-muted-foreground text-xs">{format(new Date((record as any).updated_at), "MMM d, yyyy")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
