"use client";

import { useState } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import { useClasses, useStudents, useAssignments, useLessons } from "@/hooks/useSchool";
import { PageHeader } from "@/components/common/AdminUI";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, BookOpen, Clock, FileText, CheckCircle, 
  Sparkles, Calendar as CalendarIcon, ArrowRight, BrainCircuit, HeartPulse 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, isToday } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getDisplayName } from "@/lib/parent";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const firstName = user?.firstName || "Teacher";

  const [referralStudent, setReferralStudent] = useState("");
  const [referralReason, setReferralReason] = useState("");

  // Data fetching
  const { data: classesData, isLoading: lc } = useClasses(20);
  const { data: studentsData, isLoading: ls } = useStudents(50);
  const { data: assignmentsData, isLoading: la } = useAssignments();
  const { data: lessonsData, isLoading: ll } = useLessons(50);

  const allClasses = classesData?.pages.flatMap((p) => p.data) ?? [];
  const classes = allClasses;
  const students = studentsData?.pages.flatMap((p) => p.data) ?? [];
  const assignments = assignmentsData?.pages.flatMap((p) => p.data) ?? [];
  const lessons = lessonsData?.pages.flatMap((p) => p.data) ?? [];

  // Filter lessons for today
  const todaysLessons = lessons.filter(l => l.scheduled_time && isToday(new Date(l.scheduled_time)));

  const activeAssignments = assignments.filter(a => !a.due_date || new Date(a.due_date) >= new Date());

  const stats = [
    { title: "My Classes", value: classes.length, icon: <BookOpen className="h-4 w-4" />, accentColor: "bg-blue-500/10 text-blue-600", loading: lc },
    { title: "Total Students", value: students.length, icon: <GraduationCap className="h-4 w-4" />, accentColor: "bg-emerald-500/10 text-emerald-600", loading: ls },
    { title: "Active Assignments", value: activeAssignments.length, icon: <FileText className="h-4 w-4" />, accentColor: "bg-violet-500/10 text-violet-600", loading: la },
    { title: "Today's Lessons", value: todaysLessons.length, icon: <Clock className="h-4 w-4" />, accentColor: "bg-orange-500/10 text-orange-600", loading: ll },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-background border p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold font-heading">Good morning, {firstName}</h1>
            <p className="text-muted-foreground mt-2 max-w-lg text-sm">
              You have {todaysLessons.length} class{todaysLessons.length !== 1 ? 'es' : ''} scheduled for today and {activeAssignments.length} pending assignments to review.
            </p>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <BookOpen className="w-64 h-64" />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="md:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" /> Today's Schedule
              </CardTitle>
              <CardDescription>{format(new Date(), "EEEE, MMMM do, yyyy")}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {ll ? (
              <div className="space-y-3 pt-4">
                {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : todaysLessons.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-3">
                <div className="p-3 bg-muted rounded-full"><CheckCircle className="h-6 w-6 text-muted-foreground" /></div>
                <p className="text-sm font-medium">No classes scheduled for today.</p>
                <p className="text-xs text-muted-foreground">Enjoy your free time or prepare for upcoming lessons.</p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {todaysLessons.map((lesson, index) => (
                  <motion.div 
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow group cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <p className="text-sm font-bold text-primary">{format(new Date(lesson.scheduled_time!), "h:mm a")}</p>
                    </div>
                    <div className="w-px h-10 bg-border hidden sm:block"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{lesson.title}</p>
                      {(() => {
                        const c = allClasses.find(c => c.id === lesson.class_id);
                        return <p className="text-xs text-muted-foreground truncate">{c ? `Class ${c.grade} - Section ${c.section}` : "Unknown Class"}</p>;
                      })()}
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Laura AI Insights */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" /> AI Assistant
            </CardTitle>
            <CardDescription>Daily insights from Laura AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3.5 bg-background rounded-xl border shadow-sm text-sm">
                <span className="font-semibold text-primary">Suggestion:</span> 3 students struggled with the last Math quiz. I can generate a specialized review worksheet for them.
              </div>
              
              <Link href="/teacher/laura" className="block w-full mt-4">
                <Button variant="outline" className="w-full gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" /> Ask Laura AI
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Clinical Support & Referrals */}
        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-rose-500" /> Clinical Support & Referrals
            </CardTitle>
            <CardDescription>Request a therapist appointment for students needing extra support.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">If a student is underperforming or exhibiting physical/mental challenges, request a clinical evaluation. This appointment will automatically sync to the student's and therapist's calendars.</p>
            <div className="space-y-3">
              <Select value={referralStudent} onValueChange={setReferralStudent}>
                <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Select a student to refer..." /></SelectTrigger>
                <SelectContent>
                  {students.slice(0, 15).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{getDisplayName((s as any).user || s) === "Unknown" ? `Student ${s.id.substring(0, 6)}` : getDisplayName((s as any).user || s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea 
                placeholder="Describe the academic, physical, or mental challenges the student is facing..." 
                value={referralReason} 
                onChange={(e) => setReferralReason(e.target.value)}
                className="resize-none bg-background" 
                rows={3} 
              />
              <Button 
                className="w-full gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                onClick={() => {
                  if(!referralStudent || !referralReason) {
                    toast.error("Please select a student and provide a reason for the referral.");
                    return;
                  }
                  
                  const studentObj = students.find((s: any) => s.id === referralStudent);
                  const studentName = studentObj ? getDisplayName((studentObj as any).user || studentObj) : "Student";
                  
                  const referrals = JSON.parse(localStorage.getItem("therapist-referrals") || "[]");
                  referrals.push({
                    id: `ref-${Date.now()}`,
                    studentId: referralStudent,
                    userId: studentObj?.user_id,
                    studentName,
                    reason: referralReason,
                    teacherName: firstName,
                    status: "pending",
                    date: new Date().toISOString()
                  });
                  localStorage.setItem("therapist-referrals", JSON.stringify(referrals));
                  
                  // Trigger pub/sub for cross-tab updates if needed
                  window.dispatchEvent(new Event("storage"));

                  toast.success("Therapist appointment requested! The student and clinical team have been notified.");
                  setReferralStudent("");
                  setReferralReason("");
                }}
              >
                <HeartPulse className="h-4 w-4" /> Request Therapist Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
