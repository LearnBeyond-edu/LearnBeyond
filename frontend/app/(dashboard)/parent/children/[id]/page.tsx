"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { useStudent, useAttendance, useProgress, useAssignments, useQuizzes, useSubmissions, useLessons } from "@/hooks/useSchool";
import { useNotifications } from "@/hooks/usePlatform";
import { PageHeader, EmptyState, ErrorState, TableSkeleton } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Award, BookOpen, ClipboardCheck, FileText, Flame, GraduationCap, Heart, MessageSquare, Sparkles, Star, Users, CheckSquare } from "lucide-react";
import { flattenInfinitePages, getDisplayName, getInitials, average, formatDateValue, learningLevel, scoreTone } from "@/lib/parent";

export default function ParentChildProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const childId = params.id;

  const { data: student, isLoading: studentLoading, isError: studentError, refetch: refetchStudent } = useStudent(childId);
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance();
  const { data: progressData, isLoading: progressLoading } = useProgress({ student_id: childId });
  const { data: assignmentsData } = useAssignments();
  const { data: quizzesData } = useQuizzes();
  const { data: submissionsData } = useSubmissions({}, 100);
  const { data: lessonsData } = useLessons();
  const { data: notificationsData } = useNotifications();
  const [parentNote, setParentNote] = useState("");
  const [localStore, setLocalStore] = useState<any>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(`parent-note-${childId}`);
    if (saved) setParentNote(saved);
    
    if (student?.user_id) {
      try {
        const storeStr = window.localStorage.getItem(`learnbeyond-learning-system-store-${student.user_id}`);
        if (storeStr) {
          const parsed = JSON.parse(storeStr);
          if (parsed.state) setLocalStore(parsed.state);
        }
      } catch (e) {
        console.error("Failed to parse student local store", e);
      }
    }
  }, [childId, student?.user_id]);

  const attendance = flattenInfinitePages(attendanceData);
  const progress = flattenInfinitePages(progressData);
  const assignments = flattenInfinitePages(assignmentsData);
  const quizzes = flattenInfinitePages(quizzesData);
  const submissions = flattenInfinitePages(submissionsData);
  const lessons = flattenInfinitePages(lessonsData);
  const notifications = notificationsData?.data ?? [];

  const childAttendance = attendance.filter((entry) => entry.student_id === childId || (student?.user_id && entry.student_id === student.user_id));
  const childProgress = progress.filter((entry) => entry.student_id === childId || (student?.user_id && entry.student_id === student.user_id));
  const childSubmissions = submissions.filter((entry) => 
    entry.student_id === childId || 
    entry.student_id === student?.id || 
    entry.student_id === student?.user_id || 
    (student?.first_name && entry.student_name && entry.student_name.toLowerCase().includes(student.first_name.toLowerCase()))
  );
  const classIds = new Map<string, number>();
  childAttendance.forEach((record) => classIds.set(record.class_id, (classIds.get(record.class_id) ?? 0) + 1));
  let primaryClassId = [...classIds.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];
  if (!primaryClassId && student?.class_id) {
     primaryClassId = student.class_id;
  }

  const assignmentSubmissions = childSubmissions.filter((s: any) => s.assessment_type !== "quiz" && !s.quiz_id);
  const quizSubmissions = childSubmissions.filter((s: any) => s.assessment_type === "quiz" || s.quiz_id);
  
  // Merge backend data with local storage simulation data for demo purposes
  const localActivities = localStore?.recentActivity || [];
  const localCompletedLessons = localStore?.completedLessons || [];
  const localBadges = (localStore?.badges || []).filter((b: any) => b.unlocked);
  
  const allScores = [...childProgress.map((entry) => (entry as any).completion_percentage ?? 100), ...childSubmissions.filter(s => s.score !== null && s.score !== undefined).map(s => s.score), ...localActivities.filter((a: any) => a.score !== undefined).map((a: any) => a.score)];
  const childScore = allScores.length > 0 ? average(allScores) : 0;
  const attendanceRate = childAttendance.length ? Math.round((childAttendance.filter((entry) => entry.status === "present").length / childAttendance.length) * 100) : (localStore ? 100 : 0);
  const lessonCount = childProgress.length;
  const currentLesson = lessons.find((lesson) => lesson.id === childProgress[0]?.lesson_id);
  const teacherNotes = notifications.filter((entry) => /teacher|class|lesson|progress|support/i.test(`${entry.title} ${entry.message}`)).slice(0, 5);
  const therapistNotes = notifications.filter((entry) => /therapy|therapist|support|wellbeing/i.test(`${entry.title} ${entry.message}`)).slice(0, 5);
  const achievements = [
    childScore >= 90 ? "Honor roll" : null,
    attendanceRate >= 95 ? "Perfect attendance" : null,
    lessonCount >= 5 ? "Momentum badge" : null,
    childProgress.some((entry) => (entry as any).completion_percentage !== null && (entry as any).completion_percentage < 70) ? "Needs reinforcement" : null,
    ...localBadges.map((b: any) => b.name)
  ].filter(Boolean) as string[];

  const timeline = [
    ...childProgress.map((entry) => ({
      id: entry.id,
      sortAt: new Date((entry as any).updated_at || 0).getTime(),
      title: `Completed ${(entry as any).completion_percentage ?? 100}% of ${lessons.find((lesson) => lesson.id === entry.lesson_id)?.title ?? "a lesson"}`,
      detail: formatDateValue((entry as any).updated_at),
      icon: Star,
    })),
    ...childAttendance.map((entry) => ({
      id: entry.id,
      sortAt: new Date(entry.date).getTime(),
      title: `Attendance marked ${entry.status}`,
      detail: formatDateValue(entry.date),
      icon: ClipboardCheck,
    })),
    ...childSubmissions.map((entry) => ({
      id: entry.id,
      sortAt: new Date(entry.updated_at || entry.created_at || new Date()).getTime(),
      title: `${entry.status === "graded" ? `Graded (${entry.score ?? 0}%)` : "Submitted"} ${(entry as any).assessment_type === "assignment" || (entry as any).assignment_id ? "assignment" : "quiz"}`,
      detail: formatDateValue(entry.updated_at || entry.created_at || new Date().toISOString()),
      icon: FileText,
    })),
    ...localActivities.map((act: any) => ({
      id: act.id,
      sortAt: new Date(act.timestamp).getTime(),
      title: `${act.title} ${act.score ? `(${act.score}%)` : ""}`,
      detail: formatDateValue(act.timestamp),
      icon: Flame,
    })),
  ].sort((left, right) => right.sortAt - left.sortAt).slice(0, 12);

  if (studentError) {
    return <ErrorState error="Failed to load child profile" onRetry={refetchStudent} />;
  }

  if (studentLoading || attendanceLoading || progressLoading) {
    return <Card><CardContent className="p-6"><TableSkeleton rows={8} cols={4} /></CardContent></Card>;
  }

  if (!student) {
    return <ErrorState error="This child profile is not available to your account" onRetry={() => router.push("/parent/children")} />;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader title={getDisplayName(student)} subtitle="Complete child profile and family notes" />
      </div>

      <Card className="overflow-hidden border-border/60">
        <div className="bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-transparent p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-background shadow-sm"><AvatarFallback className="bg-rose-500/10 text-rose-600 text-xl font-bold">{getInitials(student)}</AvatarFallback></Avatar>
              <div>
                <h1 className="text-2xl font-bold font-heading">{getDisplayName(student)}</h1>
                <p className="text-sm text-muted-foreground">Authorized child profile • {(student as any).institution_name ? (student as any).institution_name : (student.institution_id ? `Institution ${student.institution_id.slice(0, 8)}` : "Shared account")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> {learningLevel(childScore)}</Badge>
                  <Badge variant="outline" className="gap-1.5"><Heart className="h-3.5 w-3.5" /> {attendanceRate}% attendance</Badge>
                  <Badge variant="outline" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> {scoreTone(childScore).replace("-", " ")}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <div className="rounded-2xl border bg-background/70 p-4"><p className="text-xs text-muted-foreground">Average score</p><p className="mt-1 text-3xl font-bold font-heading text-emerald-600">{childScore}%</p></div>
              <div className="rounded-2xl border bg-background/70 p-4"><p className="text-xs text-muted-foreground">Lessons completed</p><p className="mt-1 text-3xl font-bold font-heading text-blue-600">{lessonCount}</p></div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList variant="line" className="w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          {[
            ["overview", "Overview"],
            ["assignments", "Assignments"],
            ["quizzes", "Quizzes"],
            ["performance", "Performance"],
            ["notes", "Notes"],
            ["timeline", "Timeline"],
          ].map(([value, label]) => <TabsTrigger key={value} value={value} className="rounded-full border px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background">{label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Attendance rate", value: `${attendanceRate}%`, tone: "text-blue-600" },
              { label: "Current level", value: learningLevel(childScore), tone: "text-rose-600" },
              { label: "Assignments Done", value: assignmentSubmissions.length, tone: "text-violet-600" },
              { label: "Quizzes Finished", value: quizSubmissions.length, tone: "text-emerald-600" },
            ].map((item) => (
              <Card key={item.label} className="border-border/60"><CardContent className="p-5"><p className="text-sm text-muted-foreground">{item.label}</p><p className={`mt-2 text-3xl font-bold font-heading ${item.tone}`}>{item.value}</p></CardContent></Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Personal details</CardTitle>
                <CardDescription>Profile information returned by the backend.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {[
                  { label: "Student ID", value: student.id },
                  { label: "Institution", value: (student as any).institution_name ?? student.institution_id ?? "—" },
                  { label: "Created", value: formatDateValue(student.created_at) },
                  { label: "Updated", value: formatDateValue(student.updated_at) },
                ].map((item) => <div key={item.label} className="rounded-2xl border bg-muted/20 p-4"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-1 text-sm font-medium">{item.value}</p></div>)}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-rose-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-rose-500" /> Learning style</CardTitle>
                <CardDescription>Derived from current performance trends.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border bg-background p-3">{childScore >= 90 ? "Independent and fast-moving." : childScore >= 80 ? "Balanced with regular check-ins." : "Benefits from guided practice and repetition."}</div>
                <div className="rounded-2xl border bg-background p-3">{attendanceRate >= 95 ? "Very consistent attendance rhythm." : "Attendance routines need reinforcement."}</div>
                <div className="rounded-2xl border bg-background p-3">{childProgress.length >= 5 ? "Recent work shows momentum." : "More activity is needed to build momentum."}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/60"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Attendance today</p><p className="mt-2 text-2xl font-bold font-heading">{childAttendance.filter((entry) => format(new Date(entry.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length}</p></CardContent></Card>
            <Card className="border-border/60"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Recent shared notes</p><p className="mt-2 text-2xl font-bold font-heading">{teacherNotes.length}</p></CardContent></Card>
            <Card className="border-border/60"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Rewards earned</p><p className="mt-2 text-2xl font-bold font-heading">{achievements.length}</p></CardContent></Card>
          </div>
        </TabsContent>



        <TabsContent value="assignments" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Assignments</CardTitle><CardDescription>Completed assignment submissions, teacher reviews, and scores.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {assignmentSubmissions.length === 0 ? (
                <EmptyState icon={<FileText className="h-10 w-10" />} title="No assignments submitted" description="Student has not submitted any assignments yet." />
              ) : (
                <div className="space-y-3">
                  {assignmentSubmissions.map((sub: any) => {
                    const matchedAsgn = assignments.find(a => a.id === sub.assignment_id || a.id === sub.assessment_id);
                    const title = matchedAsgn?.title || (sub.assessment_id ? `Assignment (${sub.assessment_id.slice(0, 8)})` : "Homework Assignment");
                    return (
                      <div key={sub.id} className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2.5 h-2.5 rounded-full shadow-sm bg-violet-500 shadow-violet-500/20 mt-1.5 shrink-0" />
                            <div>
                              <p className="text-sm font-bold">{title}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(sub.updated_at || sub.created_at || new Date()), "MMM d, yyyy · h:mm a")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {sub.score !== null && sub.score !== undefined && (
                              <span className="text-base font-extrabold text-violet-600 dark:text-violet-400">{sub.score}/100</span>
                            )}
                            <Badge variant="outline" className="text-xs capitalize font-semibold border-violet-500/30 text-violet-600 bg-violet-500/10">
                              {sub.status || "Submitted"}
                            </Badge>
                          </div>
                        </div>
                        {sub.feedback && (
                          <div className="ml-5 p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/20 text-xs text-muted-foreground">
                            <span className="font-bold text-foreground">Teacher Feedback: </span>
                            <span className="italic">"{sub.feedback}"</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Quiz results</CardTitle><CardDescription>Completed quizzes, final evaluations, and performance scores.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {quizSubmissions.length === 0 ? (
                <EmptyState icon={<CheckSquare className="h-10 w-10" />} title="No quiz results" description="Student has not completed any quizzes yet." />
              ) : (
                <div className="space-y-3">
                  {quizSubmissions.map((sub: any) => {
                    const matchedQuiz = quizzes.find(q => q.id === sub.quiz_id || q.id === sub.assessment_id);
                    const title = matchedQuiz?.title || (sub.assessment_id ? `Quiz (${sub.assessment_id.slice(0, 8)})` : "Class Quiz");
                    return (
                      <div key={sub.id} className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2.5 h-2.5 rounded-full shadow-sm bg-orange-500 shadow-orange-500/20 mt-1.5 shrink-0" />
                            <div>
                              <p className="text-sm font-bold">{title}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(sub.updated_at || sub.created_at || new Date()), "MMM d, yyyy · h:mm a")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-base font-extrabold text-orange-600 dark:text-orange-400">{sub.score ?? 100}%</span>
                            <Badge variant="outline" className="text-xs capitalize font-semibold border-orange-500/30 text-orange-600 bg-orange-500/10">
                              {sub.status || "Graded"}
                            </Badge>
                          </div>
                        </div>
                        {sub.feedback && (
                          <div className="ml-5 p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/20 text-xs text-muted-foreground">
                            <span className="font-bold text-foreground">Teacher Evaluation: </span>
                            <span className="italic">"{sub.feedback}"</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/60"><CardHeader><CardTitle className="text-base">Academic performance</CardTitle><CardDescription>Recent lesson completion and score bands.</CardDescription></CardHeader><CardContent className="space-y-3">{childProgress.length === 0 && localActivities.length === 0 ? <EmptyState icon={<BookOpen className="h-12 w-12" />} title="No progress records" description="Academic progress appears when lessons are completed." /> : [...childProgress.map(p => ({ id: p.id, title: lessons.find(l => l.id === p.lesson_id)?.title || 'Lesson', date: (p as any).updated_at, score: (p as any).completion_percentage ?? 100 })), ...localActivities.map((a: any) => ({ id: a.id, title: a.title, date: a.timestamp, score: a.score }))].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8).map((entry) => { return <div key={entry.id} className="rounded-2xl border p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">{entry.title}</p><p className="text-xs text-muted-foreground">{formatDateValue(entry.date)}</p></div><p className="text-sm font-semibold text-emerald-600">{entry.score ?? 0}%</p></div></div>; })}</CardContent></Card>

            <Card className="border-border/60 bg-gradient-to-br from-rose-500/5 to-transparent"><CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-rose-500" /> Achievements & rewards</CardTitle><CardDescription>Milestones derived from available backend data.</CardDescription></CardHeader><CardContent className="space-y-3">{achievements.length === 0 ? <EmptyState icon={<Award className="h-12 w-12" />} title="No achievements yet" description="Rewards will appear as score and attendance milestones are reached." /> : achievements.map((achievement) => <div key={achievement} className="rounded-2xl border bg-background p-3 text-sm">{achievement}</div>)}<div className="rounded-2xl border bg-background p-3 text-sm">{currentLesson ? `Most recent lesson: ${currentLesson.title}` : "No lesson context is available yet."}</div></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 border-border/60"><CardHeader><CardTitle className="text-base">Parent notes</CardTitle><CardDescription>Saved locally per child for quick follow-up.</CardDescription></CardHeader><CardContent className="space-y-3"><Textarea value={parentNote} onChange={(event) => { const value = event.target.value; setParentNote(value); window.localStorage.setItem(`parent-note-${childId}`, value); }} placeholder="Capture routines, reminders, and follow-up items for this child" rows={6} /><p className="text-xs text-muted-foreground">No backend notes endpoint exists, so this stays local to the browser.</p></CardContent></Card>

          <Card className="border-border/60"><CardHeader><CardTitle className="text-base">Shared notes</CardTitle><CardDescription>Teacher and therapist notes if they are surfaced in notifications.</CardDescription></CardHeader><CardContent className="space-y-3 text-sm">{teacherNotes.length === 0 ? <EmptyState icon={<MessageSquare className="h-10 w-10" />} title="No teacher notes" description="Shared teacher notes have not been published for this child yet." /> : teacherNotes.map((note) => <div key={note.id} className="rounded-2xl border bg-background p-3"><p className="font-medium">{note.title}</p><p className="mt-1 text-xs text-muted-foreground">{note.message}</p></div>)}{therapistNotes.length > 0 && <div className="rounded-2xl border bg-muted/20 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Therapist notes</p><p className="mt-2 text-xs text-muted-foreground">{therapistNotes.length} shared note(s) surfaced through notifications.</p></div>}</CardContent></Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="border-border/60"><CardHeader><CardTitle className="text-base">Timeline</CardTitle><CardDescription>Combined academic and attendance history.</CardDescription></CardHeader><CardContent className="space-y-3">{timeline.length === 0 ? <EmptyState icon={<Flame className="h-12 w-12" />} title="No timeline entries" description="Timeline events appear as progress, attendance, or submissions are recorded." /> : timeline.map((entry) => <div key={entry.id} className="flex items-start gap-3 rounded-2xl border p-3"><div className="rounded-full bg-rose-500/10 p-2 text-rose-600"><entry.icon className="h-4 w-4" /></div><div><p className="text-sm font-medium">{entry.title}</p><p className="text-xs text-muted-foreground">{entry.detail}</p></div></div>)}</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}