"use client";

import { motion } from "framer-motion";
import {
  Users, GraduationCap, Heart, Brain, ClipboardCheck,
  Sparkles, Activity, Building2, Megaphone, CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useClasses, useTeachers, useStudents, useParents, useTherapists, useAttendance } from "@/hooks/useSchool";
import { useInstitution } from "@/hooks/useInstitutions";
import { useAuthStore } from "@/store/useAuthStore";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { SchoolClass } from "@/types/school";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function SchoolDashboard() {
  const { user } = useAuthStore();

  // Pull all counts from real backend
  const { data: classesData, isLoading: lc } = useClasses(100);
  const { data: teachersData, isLoading: lt } = useTeachers(100);
  const { data: studentsData, isLoading: lst } = useStudents(100);
  const { data: parentsData, isLoading: lp } = useParents(100);
  const { data: therapistsData, isLoading: lth } = useTherapists(100);
  const { data: attendanceData, isLoading: la } = useAttendance();

  const teachers = teachersData?.pages.flatMap((p) => p?.data || []) ?? [];
  const students = studentsData?.pages.flatMap((p) => p?.data || []) ?? [];
  const parents = parentsData?.pages.flatMap((p) => p?.data || []) ?? [];
  const therapists = therapistsData?.pages.flatMap((p) => p?.data || []) ?? [];
  const classes = classesData?.pages.flatMap((p) => p?.data || []) ?? [];

  const stats = [
    { title: "Classes", value: classes.length, icon: <Building2 className="h-4 w-4" />, accentColor: "bg-blue-500/10 text-blue-500", loading: lc },
    { title: "Teachers", value: teachers.length, icon: <Users className="h-4 w-4" />, accentColor: "bg-violet-500/10 text-violet-500", loading: lt },
    { title: "Students", value: students.length, icon: <GraduationCap className="h-4 w-4" />, accentColor: "bg-green-500/10 text-green-500", loading: lst },
    { title: "Therapists", value: therapists.length, icon: <Brain className="h-4 w-4" />, accentColor: "bg-orange-500/10 text-orange-500", loading: lth },
  ];

  const recentStudents = [...students]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title={`Good morning, ${user?.firstName ?? "Administrator"} 👋`}
        subtitle="Here's your school overview for today."
      />

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <motion.div key={s.title} variants={item}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Class Populations (Aggregated) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Class Populations</CardTitle>
            <CardDescription>Overview of student distribution across active classes</CardDescription>
          </CardHeader>
          <CardContent>
            {lc || lst ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
            ) : classes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No classes created yet.</p>
            ) : (
              <div className="space-y-3">
                {classes.slice(0, 5).map((cls) => {
                  const className = `Grade ${cls.grade} - Section ${cls.section}`;
                  // Consume actual student count from the backend subquery
                  const studentCount = Number((cls as any).student_count) || 0; 
                  return (
                    <div key={cls.id} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{className}</p>
                        <p className="text-xs text-muted-foreground truncate">Year: {cls.academic_year}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">{studentCount}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Students</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrollment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Students", value: students.length, color: "bg-green-500" },
                { label: "Teachers", value: teachers.length, color: "bg-violet-500" },
                { label: "Therapists", value: therapists.length, color: "bg-orange-500" },
              ].map(({ label, value, color }) => {
                const total = students.length + teachers.length + therapists.length;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: total > 0 ? `${(value / total) * 100}%` : "0%" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full ${color} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Overview & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overall Class Performance</CardTitle>
            <CardDescription>Average performance metrics across all active classes</CardDescription>
          </CardHeader>
          <CardContent>
            {lc ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : classes.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Activity className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No classes created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {classes.slice(0, 5).map((cls) => {
                  const className = `Grade ${cls.grade} - Section ${cls.section}`;
                  // Mocking performance score based on ID for visual consistency
                  const mockScore = 75 + (className.length % 20);
                  return (
                    <div key={cls.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate max-w-[150px]" title={className}>{className}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={mockScore > 85 ? 'text-green-600 bg-green-500/10' : mockScore > 75 ? 'text-blue-600 bg-blue-500/10' : 'text-orange-600 bg-orange-500/10'}>
                            {mockScore}% Avg
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${mockScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${mockScore > 85 ? 'bg-green-500' : mockScore > 75 ? 'bg-blue-500' : 'bg-orange-500'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "View Students", href: "/school/students", icon: GraduationCap, color: "text-green-500 bg-green-500/10" },
                { label: "Add Staff", href: "/school/teachers", icon: Users, color: "text-violet-500 bg-violet-500/10" },
                { label: "Laura AI", href: "/school/laura", icon: Sparkles, color: "text-purple-500 bg-purple-500/10" },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link key={label} href={href} className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:bg-muted/50 transition-colors text-center group">
                  <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
