"use client";

import React, { useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLearningStore } from "@/store/useLearningStore";
import { useClasses, useLessons, useAssignments, useQuizzes, useProgress, useSubmissions } from "@/hooks/useSchool";
import { useAnnouncementStore } from "@/store/useAnnouncementStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, BrainCircuit, Calendar, Trophy, Flame, Coins, Sparkles, ChevronRight,
  TrendingUp, Activity, Compass, AlertCircle, PlayCircle, PlusCircle, CheckCircle, Megaphone, Pin, HeartPulse
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { xp, level, streak, coins, goals, recentActivity, checkDailyLogin } = useLearningStore();

  useEffect(() => {
    checkDailyLogin();
  }, [checkDailyLogin]);

  // Role-based redirect to prevent admins/teachers from seeing the student dashboard
  useEffect(() => {
    if (!user?.role) return;
    const roleStr = String(user.role).toLowerCase();
    
    if (roleStr.includes('platform admin') || roleStr === 'super_admin') {
      router.push('/admin');
    } else if (roleStr.includes('institution admin') || roleStr.includes('school admin') || roleStr === 'admin' || roleStr === 'school') {
      router.push('/school');
    } else if (roleStr.includes('teacher')) {
      router.push('/teacher');
    } else if (roleStr.includes('parent')) {
      router.push('/parent');
    } else if (roleStr.includes('therapist')) {
      router.push('/therapist');
    }
  }, [user, router]);

  // Fetch real backend data
  const { data: classesData, isLoading: classesLoading } = useClasses(10);
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons(10);
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments();
  const { data: quizzesData, isLoading: quizzesLoading } = useQuizzes(10);
  const { data: submissionsData } = useSubmissions({ student_id: user?.id }, 50);
  const { data: progressData } = useProgress();

  const [therapistAppointments, setTherapistAppointments] = useState<any[]>([]);

  useEffect(() => {
    const loadAppointments = () => {
      const refs = JSON.parse(localStorage.getItem("therapist-referrals") || "[]");
      setTherapistAppointments(refs.filter((r: any) => {
        const matchesId = r.userId === user?.id || r.studentId === user?.id;
        const matchesName = user?.firstName && r.studentName?.toLowerCase().includes(user.firstName.toLowerCase());
        return (matchesId || matchesName) && r.status !== "completed" && r.status !== "cancelled" && r.status !== "pending";
      }));
    };
    
    loadAppointments();
    window.addEventListener("storage", loadAppointments);
    return () => window.removeEventListener("storage", loadAppointments);
  }, [user?.id]);
  
  // Announcements
  const { announcements } = useAnnouncementStore();
  const roleMap: Record<string, string> = {
    "Student": "students",
    "Teacher": "teachers",
    "Parent": "parents",
    "Therapist": "therapists",
  };
  const userAudience = roleMap[user?.role || ""] || "everyone";
  const relevantAnnouncements = announcements.filter(a => a.audience === "everyone" || a.audience === userAudience);
  const displayAnnouncements = relevantAnnouncements.slice(0, 3); // top 3

  // Helper to extract flat list from infinite query pagination structure
  const enrolledClasses = useMemo(() => {
    return (classesData?.pages?.flatMap(p => p.data) || []).filter(c => c.institution_id === user?.institutionId);
  }, [classesData, user]);

  const upcomingLessons = useMemo(() => {
    const classIds = enrolledClasses.map(c => c.id);
    return (lessonsData?.pages?.flatMap(p => p.data) || []).filter(l => classIds.includes(l.class_id));
  }, [lessonsData, enrolledClasses]);

  const upcomingAssignments = useMemo(() => {
    const classIds = enrolledClasses.map(c => c.id);
    const submittedIds = (submissionsData?.pages?.flatMap(p => p.data) || []).filter(s => s.assignment_id).map(s => s.assignment_id);
    return (assignmentsData?.pages?.flatMap(p => p.data) || []).filter(a => classIds.includes(a.class_id) && !submittedIds.includes(a.id));
  }, [assignmentsData, enrolledClasses, submissionsData]);

  const upcomingQuizzes = useMemo(() => {
    const classIds = enrolledClasses.map(c => c.id);
    const submittedIds = (submissionsData?.pages?.flatMap(p => p.data) || []).filter(s => (s as any).quiz_id).map(s => (s as any).quiz_id);
    return (quizzesData?.pages?.flatMap(p => p.data) || []).filter(q => classIds.includes(q.class_id) && !submittedIds.includes(q.id));
  }, [quizzesData, enrolledClasses, submissionsData]);

  // Compute stats
  const totalClasses = enrolledClasses.length;
  const completedXPPercent = Math.round((xp % 500) / 500 * 100);
  const xpNeeded = (level * 500) - xp;

  // Chart data
  const performanceData = [
    { name: "Mon", xp: 120, rate: 85 },
    { name: "Tue", xp: 240, rate: 88 },
    { name: "Wed", xp: 180, rate: 90 },
    { name: "Thu", xp: 320, rate: 89 },
    { name: "Fri", xp: 450, rate: 92 },
    { name: "Sat", xp: 150, rate: 94 },
    { name: "Sun", xp: 200, rate: 95 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Gamified Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/10">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">
            Welcome back, {user?.firstName || "Student"}!
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            You are currently on a <strong>{streak} day</strong> learning streak. Keep the momentum going!
          </p>
        </div>

        {/* Gamified stats bar */}
        <div className="flex gap-3 flex-wrap items-center">
          <Badge className="bg-orange-500/10 text-orange-600 border-none font-bold gap-1 text-xs py-1.5 px-3">
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500" /> {streak} Days
          </Badge>
          <Badge className="bg-yellow-500/10 text-yellow-600 border-none font-bold gap-1 text-xs py-1.5 px-3">
            <Coins className="h-4 w-4 fill-yellow-500 text-yellow-500" /> {coins} Coins
          </Badge>
          <Badge className="bg-teal-500/10 text-teal-600 border-none font-bold gap-1 text-xs py-1.5 px-3">
            <Trophy className="h-4 w-4 text-teal-500" /> Level {level}
          </Badge>
        </div>
      </div>

      {/* Overview Widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* XP Level Progress Card */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">XP Level Status</CardTitle>
            <Trophy className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-2xl font-bold">{xp}</span>
              <span className="text-[10px] text-muted-foreground ml-1.5">total XP</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>Level {level}</span>
                <span>{xpNeeded} XP to Level {level + 1}</span>
              </div>
              <div className="w-full bg-teal-500/10 rounded-full h-2 overflow-hidden">
                <div className="bg-teal-600 h-full transition-all duration-300" style={{ width: `${completedXPPercent}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes Enrollment */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">My Enrolled Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {classesLoading ? (
              <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
            ) : (
              <div>
                <span className="text-2xl font-bold">{totalClasses}</span>
                <span className="text-[10px] text-muted-foreground ml-1.5">active courses</span>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Navigate to class panels to complete modules.
                </p>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Goals Meter */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Goals Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-2xl font-bold">
                {goals.filter(g => g.completed).length} / {goals.length}
              </span>
              <span className="text-[10px] text-muted-foreground ml-1.5">completed goals</span>
            </div>
            <div className="w-full bg-emerald-500/10 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${(goals.filter(g => g.completed).length / (goals.length || 1)) * 100}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Continue Learning & Analytics */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Continue Learning */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b"><CardTitle className="text-sm font-bold">Continue Learning</CardTitle></CardHeader>
            <CardContent className="pt-4 space-y-3">
              {lessonsLoading ? (
                <div className="space-y-2">
                  <div className="h-12 w-full bg-muted animate-pulse rounded-xl" />
                  <div className="h-12 w-full bg-muted animate-pulse rounded-xl" />
                </div>
              ) : upcomingLessons.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground italic">No active lessons assigned. Check back later!</div>
              ) : (
                upcomingLessons.slice(0, 2).map((lesson) => (
                  <div key={lesson.id} className="flex justify-between items-center p-3 rounded-2xl bg-muted/30 border hover:bg-muted/50 transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs">{lesson.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[280px]">{lesson.description || "No description provided."}</p>
                    </div>
                    <Link href={`/lessons/${lesson.id}`}>
                      <Button size="sm" className="h-8 gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
                        <PlayCircle className="h-3.5 w-3.5" /> Start
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Therapist Appointments */}
          {therapistAppointments.length > 0 && (
            <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><HeartPulse className="h-4 w-4 text-rose-500" /> Scheduled Therapy Sessions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {therapistAppointments.map((app) => (
                  <div key={app.id} className="flex justify-between items-center p-3 rounded-2xl bg-card border shadow-sm">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs text-rose-600">Clinical Support Appointment</p>
                      <p className="text-[10px] text-muted-foreground">Scheduled for: <span className="font-bold">{app.time}</span></p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Learning Progress Charts */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b"><CardTitle className="text-sm font-bold">XP Velocity & Accuracy</CardTitle></CardHeader>
            <CardContent className="pt-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: "12px", fontSize: "10px" }} />
                    <Area type="monotone" dataKey="xp" stroke="#0d9488" fillOpacity={1} fill="url(#colorXp)" strokeWidth={2} name="XP Earned" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar Info & Tasks */}
        <div className="space-y-6">
          
          {/* AI Recommended Tasks */}
          <Card className="border-border/60 bg-gradient-to-b from-teal-500/5 to-transparent">
            <CardHeader className="pb-3 border-b border-border/40"><CardTitle className="text-xs font-bold flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-teal-600 animate-pulse" /> Laura AI Recommendations</CardTitle></CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              <div className="p-3 bg-card border rounded-2xl text-[11px] space-y-1.5">
                <p className="font-bold text-teal-600">Algebra Formula Practice</p>
                <p className="text-muted-foreground leading-relaxed">
                  Based on your last quiz score of 92%, practicing quadratic equations will help you secure perfect grades.
                </p>
                <Link href="/quizzes">
                  <Button variant="link" className="text-teal-600 p-0 h-auto text-[10px] font-bold mt-1">Review Quizzes →</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-bold">Quick Navigation</CardTitle></CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-2">
              <Link href="/lessons" className="w-full">
                <Button variant="outline" className="w-full text-[11px] h-9 gap-1 rounded-xl"><BookOpen className="h-3.5 w-3.5" /> Read Lesson</Button>
              </Link>
              <Link href="/quizzes" className="w-full">
                <Button variant="outline" className="w-full text-[11px] h-9 gap-1 rounded-xl"><Activity className="h-3.5 w-3.5" /> Take Quiz</Button>
              </Link>
              <Link href="/analytics" className="w-full">
                <Button variant="outline" className="w-full text-[11px] h-9 gap-1 rounded-xl"><Trophy className="h-3.5 w-3.5" /> Analytics</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Announcements Widget */}
          {displayAnnouncements.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-bold flex items-center gap-1.5"><Megaphone className="h-4 w-4 text-primary" /> Announcements</CardTitle></CardHeader>
              <CardContent className="pt-4 space-y-3">
                {displayAnnouncements.map((announcement) => (
                  <div key={announcement.id} className={`p-3 rounded-2xl border ${announcement.pinned ? 'bg-primary/5 border-primary/20' : 'bg-card border-border/60'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-xs flex items-center gap-1">
                        {announcement.pinned && <Pin className="h-3 w-3 text-primary" />}
                        {announcement.title}
                      </h4>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2">
                        {format(new Date(announcement.createdAt), "MMM d")}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-3 leading-relaxed">
                      {announcement.message}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
}
