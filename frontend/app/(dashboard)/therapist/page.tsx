"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents } from "@/hooks/useSchool";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, FileText, Brain, Calendar, CheckCircle, HeartPulse, UserPlus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { TherapyAssessmentRecord, safeReadLocalStorage } from "@/lib/therapist";

export default function TherapistDashboard() {
  const { user } = useAuthStore();
  const firstName = user?.firstName || "Therapist";

  const { data: studentsData, isLoading: ls } = useStudents(100);
  const students = studentsData?.pages.flatMap(p => p.data) ?? [];

  const [assessments, setAssessments] = useState<TherapyAssessmentRecord[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      const saved = safeReadLocalStorage<TherapyAssessmentRecord[] | null>("therapist-assessments", null);
      if (saved) setAssessments(saved);
      
      const refs = JSON.parse(localStorage.getItem("therapist-referrals") || "[]");
      setReferrals(refs);
    };
    
    loadData();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  const scheduleReferral = (id: string) => {
    const time = prompt("Enter a time for the appointment (e.g. 'Tomorrow 10:00 AM'):");
    if (!time) return;

    const updated = referrals.map(r => r.id === id ? { ...r, status: "scheduled", time } : r);
    localStorage.setItem("therapist-referrals", JSON.stringify(updated));
    setReferrals(updated);
    window.dispatchEvent(new Event("storage"));
    toast.success("Appointment scheduled and student notified!");
  };

  const pendingReferrals = referrals.filter(r => r.status === "pending");

  const pendingAssessments = assessments.filter(a => a.status === 'pending');
  const completedAssessments = assessments.filter(a => a.status === 'completed');

  const stats = [
    { title: "Assigned Students", value: students.length, icon: <Users className="h-4 w-4" />, accentColor: "bg-teal-500/10 text-teal-600", loading: ls },
    { title: "Pending Assessments", value: pendingAssessments.length, icon: <ClipboardList className="h-4 w-4" />, accentColor: "bg-blue-500/10 text-blue-600", loading: false },
    { title: "Completed Assessments", value: completedAssessments.length, icon: <CheckCircle className="h-4 w-4" />, accentColor: "bg-emerald-500/10 text-emerald-600", loading: false },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600/10 via-teal-500/5 to-background border p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">Welcome back, Dr. {firstName}</h1>
            <p className="text-muted-foreground mt-2 max-w-lg text-sm">
              You have {pendingAssessments.length} pending assessments to complete.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/therapist/assessments">
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700 text-white border-none shadow-sm">
                <ClipboardList className="h-4 w-4" /> Go to Assessments
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <Brain className="w-64 h-64" />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
        <StatCard title="Pending Referrals" value={pendingReferrals.length} icon={<UserPlus className="h-4 w-4" />} accentColor="bg-rose-500/10 text-rose-600" loading={false} />
      </div>

      {/* Main Content Grid */}
      
      {pendingReferrals.length > 0 && (
        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-semibold flex items-center gap-2"><HeartPulse className="h-4 w-4 text-rose-500" /> New Teacher Referrals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {pendingReferrals.map((r, idx) => (
                <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold">{r.studentName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium text-foreground">Referred by:</span> {r.teacherName}</p>
                    <p className="text-sm mt-2 italic text-muted-foreground">"{r.reason}"</p>
                  </div>
                  <div>
                    <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-2" onClick={() => scheduleReferral(r.id)}>
                      <Calendar className="h-4 w-4" /> Schedule Appointment
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Assessments */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-semibold">Pending Assessments</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {pendingAssessments.length === 0 ? (
                 <div className="p-4 text-sm text-muted-foreground">No pending assessments at this time.</div>
              ) : pendingAssessments.slice(0, 5).map((a, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="p-4 hover:bg-muted/30 transition-colors flex items-center gap-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold">{a.studentName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.type}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completed Assessments */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-semibold">Recently Completed</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {completedAssessments.length === 0 ? (
                 <div className="p-4 text-sm text-muted-foreground">No completed assessments yet.</div>
              ) : completedAssessments.slice(0, 5).map((a, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="p-4 hover:bg-muted/30 transition-colors flex items-center gap-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold">{a.studentName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-teal-600">{a.score}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}