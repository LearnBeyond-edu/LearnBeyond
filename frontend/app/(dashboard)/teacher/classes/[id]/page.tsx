"use client";

import { use, useState } from "react";
import { useClass, useStudents, useLessons, useAssignments, useQuizzes } from "@/hooks/useSchool";
import { PageHeader, ErrorState, TableSkeleton, EmptyState } from "@/components/common/AdminUI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, FileText, CheckSquare, Presentation, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TeacherClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const { data: cls, isLoading: isClassLoading, isError: isClassError, refetch: refetchClass } = useClass(id);
  const { data: studentsData, isLoading: isStudentsLoading } = useStudents(100);
  const { data: lessonsData, isLoading: isLessonsLoading } = useLessons(100);
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useAssignments();
  const { data: quizzesData, isLoading: isQuizzesLoading } = useQuizzes();

  if (isClassError) return <ErrorState error="Failed to load class details" onRetry={refetchClass} />;
  if (isClassLoading) return <TableSkeleton rows={10} cols={1} />;
  if (!cls) return <ErrorState error="Class not found" onRetry={refetchClass} />;

  const allStudents = studentsData?.pages.flatMap((p) => p.data) ?? [];
  const allLessons = lessonsData?.pages.flatMap((p) => p.data) ?? [];
  const allAssignments = assignmentsData?.pages.flatMap((p) => p.data) ?? [];
  const allQuizzes = quizzesData?.pages.flatMap((p) => p.data) ?? [];

  // Filter for this class
  // Note: in production, filtering should happen in the backend APIs via `?class_id=xxx`.
  // Here we do it client-side since we cannot alter the backend endpoints.
  const classLessons = allLessons.filter((l: any) => l.class_id === id);
  const classAssignments = allAssignments.filter((a: any) => a.class_id === id);
  const classQuizzes = allQuizzes.filter((q: any) => q.class_id === id);
  // Simulating enrolled students (normally returned by an enrollment endpoint)
  const classStudents = allStudents.slice(0, 15); // Mocking 15 students for demo

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-[-10px]">
        <Link href="/teacher/classes" className="hover:text-primary transition-colors">Classes</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{cls.name}</span>
      </div>

      <PageHeader 
        title={cls.name} 
        subtitle={cls.description || "No description provided"} 
        actions={
          <div className="flex gap-2">
            <Button asChild><Link href="/teacher/lessons/create">New Lesson</Link></Button>
          </div>
        }
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger value="overview" className="gap-2"><Presentation className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="students" className="gap-2"><Users className="h-4 w-4" /> Students ({classStudents.length})</TabsTrigger>
          <TabsTrigger value="lessons" className="gap-2"><BookOpen className="h-4 w-4" /> Lessons ({classLessons.length})</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><FileText className="h-4 w-4" /> Assignments ({classAssignments.length})</TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-2"><CheckSquare className="h-4 w-4" /> Quizzes ({classQuizzes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 outline-none">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState 
                  icon={<Calendar className="h-10 w-10" />} 
                  title="No recent activity" 
                  description="Start creating lessons and assignments to see activity here." 
                />
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Class Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Average Attendance</p>
                    <p className="text-2xl font-bold text-emerald-600">92%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Assignment Completion</p>
                    <p className="text-2xl font-bold text-blue-600">85%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Next Class</p>
                    <p className="text-sm font-medium">Tomorrow, 10:00 AM</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-0 outline-none">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/40">
                    <th className="text-left p-4 font-medium text-muted-foreground">Student Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Joined Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                  </tr></thead>
                  <tbody>
                    {classStudents.map((s: any) => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold uppercase">
                              {s.first_name?.[0]}{s.last_name?.[0]}
                            </div>
                            {s.first_name} {s.last_name}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{format(new Date(s.created_at), "MMM d, yyyy")}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/teacher/students/${s.id}`}>Profile <ArrowRight className="h-3 w-3 ml-1" /></Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="mt-0 outline-none">
          {classLessons.length === 0 ? (
            <EmptyState 
              icon={<BookOpen className="h-14 w-14" />} 
              title="No lessons found" 
              description="Create a lesson for this class to get started." 
              action={<Link href="/teacher/lessons/create"><Button>Create Lesson</Button></Link>} 
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classLessons.map((l) => (
                <Card key={l.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-sm truncate">{l.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-1 mb-4">{l.description ?? "No description"}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/teacher/lessons/${l.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="mt-0 outline-none">
          {classAssignments.length === 0 ? (
            <EmptyState 
              icon={<FileText className="h-14 w-14" />} 
              title="No assignments found" 
              description="Assign work to students to track their progress." 
              action={<Link href="/teacher/assignments/create"><Button>Create Assignment</Button></Link>} 
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classAssignments.map((a) => (
                <Card key={a.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-sm truncate">{a.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-1 mb-4">{a.description ?? "No description"}</p>
                    <p className="text-xs text-muted-foreground font-medium bg-muted w-fit px-2 py-0.5 rounded-full mb-4">
                      Due: {a.due_date ? format(new Date(a.due_date), "MMM d, yyyy") : "No due date"}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/teacher/assignments/${a.id}/review`}>Review</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="mt-0 outline-none">
          {classQuizzes.length === 0 ? (
            <EmptyState 
              icon={<CheckSquare className="h-14 w-14" />} 
              title="No quizzes found" 
              description="Create a quiz to evaluate your students." 
              action={<Link href="/teacher/quizzes/create"><Button>Create Quiz</Button></Link>} 
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classQuizzes.map((q) => (
                <Card key={q.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-sm truncate">{q.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-1 mb-4">{q.description ?? "No description"}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/teacher/quizzes/${q.id}/review`}>Review</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
