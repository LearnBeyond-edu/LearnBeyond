"use client";

import { use, useState } from "react";
import { useStudent, useTeachers, useClasses, useParents, useAttendance, useProgress, useSubmissions, useQuizzes } from "@/hooks/useSchool";
import { PageHeader, ErrorState, TableSkeleton } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Brain, Activity, Clock, FileText, Calendar, MessageSquare, AlertTriangle, TrendingUp, CheckCircle, Target, Award } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { flattenInfinitePages, getDisplayName, average, clampPercent } from "@/lib/therapist";

export default function TherapistStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: student, isLoading } = useStudent(id);
  const { data: teachersData } = useTeachers(100);
  const { data: classesData } = useClasses(100);
  const { data: parentsData } = useParents(100);
  const { data: attendanceData } = useAttendance();
  const { data: progressData } = useProgress();
  const { data: submissionsData } = useSubmissions();
  const { data: quizzesData } = useQuizzes(100);

  const allTeachers = flattenInfinitePages(teachersData);
  const allClasses = flattenInfinitePages(classesData);
  const allAttendance = flattenInfinitePages(attendanceData);
  const allProgress = flattenInfinitePages(progressData);
  const allSubmissions = flattenInfinitePages(submissionsData);
  const allQuizzes = flattenInfinitePages(quizzesData);
  const parents = flattenInfinitePages(parentsData);

  if (isLoading) return <TableSkeleton rows={3} cols={2} />;
  if (!student) return <ErrorState error="Student not found" />;

  const studentAttendance = allAttendance.filter((record) => record.student_id === student?.id);
  const studentProgress = allProgress.filter((record) => record.student_id === student?.id);
  const studentSubmissions = allSubmissions.filter((record) => record.student_id === student?.id);
  
  const classIds = new Map<string, number>();
  studentAttendance.forEach((record) => classIds.set(record.class_id, (classIds.get(record.class_id) ?? 0) + 1));
  let primaryClassId = [...classIds.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];
  if (!primaryClassId && student?.class_id) {
     primaryClassId = student.class_id;
  }
  
  const primaryClass = primaryClassId ? allClasses.find(c => c.id === primaryClassId) : undefined;
  
  const teacher = primaryClass?.teacher_id ? allTeachers.find(t => t.id === primaryClass.teacher_id) : undefined;
  const parent = parents.find(p => p.student_id === student?.id || p.student_id === student?.user_id);

  const attendanceRate = studentAttendance.length > 0 ? clampPercent((studentAttendance.filter((record) => record.status === "present").length / studentAttendance.length) * 100) : 0;
  const progressScore = studentProgress.length > 0 ? average(studentProgress.map((record) => record.score)) : 0;
  const assignmentAvg = studentSubmissions.length > 0 ? average(studentSubmissions.map((record) => record.score || 0)) : 0;

  const initials = `${student.first_name?.[0] ?? ""}${student.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="max-w-6xl space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/therapist/students">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="Student Profile" subtitle="Comprehensive clinical and academic overview" />
      </div>

      {/* Header Card */}
      <Card className="border-border/60 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-teal-500/20 to-teal-500/5" />
        <CardContent className="p-6 pt-0 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-12">
            <div className="flex items-end gap-5">
              <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                <AvatarFallback className="text-3xl font-bold bg-teal-500/10 text-teal-600">{initials}</AvatarFallback>
              </Avatar>
              <div className="mb-1 space-y-1">
                <h1 className="text-2xl font-bold font-heading">{student.first_name} {student.last_name}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {primaryClass?.name || "Unassigned"}</span>
                  <span className="flex items-center gap-1"><Brain className="h-3.5 w-3.5" /> Progress: {progressScore}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Link href="/therapist/messages"><Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" /> Message</Button></Link>
              <Link href="/therapist/notes"><Button className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"><FileText className="h-4 w-4" /> Add Note</Button></Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto h-auto p-1">
          <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
          <TabsTrigger value="clinical" className="py-2">Clinical Data</TabsTrigger>
          <TabsTrigger value="academic" className="py-2">Academic Summary</TabsTrigger>
          <TabsTrigger value="notes" className="py-2">Multidisciplinary Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-teal-600" /> Current Clinical Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Emotional Regulation", desc: "Identify emotions using the zones of regulation chart with 80% accuracy.", status: "On Track", progress: 65 },
                    { title: "Task Initiation", desc: "Begin non-preferred tasks within 2 minutes of instruction.", status: "Needs Support", progress: 30 },
                  ].map((goal, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold">{goal.title}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${goal.status === 'On Track' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>{goal.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{goal.desc}</p>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-teal-600" /> Recent Therapy Sessions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40">
                    {[
                      { date: "Jul 18, 2026", type: "Occupational Therapy", notes: "Completed 20min obstacle course. Fine motor skills stable." },
                      { date: "Jul 15, 2026", type: "Speech Therapy", notes: "Practiced pragmatic language scenarios. Good engagement." },
                    ].map((s, i) => (
                      <div key={i} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
                        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 h-10 w-10 flex items-center justify-center flex-shrink-0">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{s.type}</h4>
                            <span className="text-[10px] text-muted-foreground">{s.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{s.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-1 space-y-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Key Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Primary Diagnosis</p>
                    <p className="font-medium">{studentProgress.length > 0 ? "Developmental Delay" : "Pending Assessment"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Teacher</p>
                    <p className="font-medium">{teacher ? getDisplayName(teacher) : "TBD"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Parent/Guardian</p>
                    <p className="font-medium">{parent ? getDisplayName(parent) : "TBD"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IEP Status</p>
                    <p className="font-medium text-emerald-600">{studentProgress.length > 0 ? "Active" : "Under Review"}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/60 bg-gradient-to-br from-amber-500/5 to-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {attendanceRate < 80 ? "Student has a low attendance rate. Monitor for avoidance behavior." : progressScore < 70 ? "Student is falling behind in clinical progress goals." : "No active clinical alerts at this time."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="clinical" className="outline-none">
          <Card className="border-border/60">
            <CardHeader><CardTitle>Clinical Progress Logs</CardTitle></CardHeader>
            <CardContent>
              {studentProgress.length === 0 ? <p className="text-muted-foreground text-sm">No clinical data available.</p> : (
                <div className="space-y-4">
                  {studentProgress.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-lg bg-muted/20 border">
                      <div>
                        <p className="font-medium text-sm">{format(new Date(p.created_at || new Date()), "MMM d, yyyy")}</p>
                        <p className="text-xs text-muted-foreground">{(p as any).notes || "Therapy objective logged"}</p>
                      </div>
                      <div className="text-lg font-bold font-heading">{p.score}%</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="academic" className="outline-none">
          <Card className="border-border/60">
            <CardHeader><CardTitle>Academic Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/10">
                     <p className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen className="h-3 w-3" /> Lessons Completed</p>
                     <p className="text-2xl font-bold font-heading">{studentProgress.length}</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/10">
                     <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Assignments Avg</p>
                     <p className="text-2xl font-bold font-heading">{assignmentAvg}%</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/10">
                     <p className="text-xs text-muted-foreground flex items-center gap-1"><Award className="h-3 w-3" /> Submissions</p>
                     <p className="text-2xl font-bold font-heading">{studentSubmissions.length}</p>
                  </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notes" className="outline-none">
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">No recent multidisciplinary notes found.</CardContent></Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
