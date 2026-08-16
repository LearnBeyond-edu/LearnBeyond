"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Calendar, TrendingUp, Users, CheckCircle, XCircle } from "lucide-react";
import { format, subDays, isSameDay } from "date-fns";
import { useAttendance } from "@/hooks/useSchool";
import { PageHeader, ErrorState, TableSkeleton } from "@/components/common/AdminUI";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Period = "daily" | "weekly" | "monthly";

export default function AttendancePage() {
  const [period, setPeriod] = useState<Period>("daily");
  const { data, isLoading, isError, refetch } = useAttendance();

  const records = data?.pages.flatMap((p) => p.data) ?? [];

  // Compute stats
  const today = new Date();
  const todayRecords = records.filter((r) => r.date && isSameDay(new Date(r.date), today));
  const weekStart = subDays(today, 7);
  const weekRecords = records.filter((r) => r.date && new Date(r.date) >= weekStart);
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const attendanceRate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  // Group by date for last 7 days chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dayRecords = records.filter((r) => r.date && isSameDay(new Date(r.date), date));
    const dayPresent = dayRecords.filter((r) => r.status === "present").length;
    return { date, label: format(date, "EEE"), count: dayRecords.length, present: dayPresent };
  });

  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Attendance"
        subtitle={`${records.length} attendance records in total`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Today's Records" value={todayRecords.length} icon={<Calendar className="h-4 w-4" />} accentColor="bg-blue-500/10 text-blue-500" loading={isLoading} />
        <StatCard title="Present (All)" value={present} icon={<CheckCircle className="h-4 w-4" />} accentColor="bg-green-500/10 text-green-500" loading={isLoading} />
        <StatCard title="Absent (All)" value={absent} icon={<XCircle className="h-4 w-4" />} accentColor="bg-red-500/10 text-red-500" loading={isLoading} />
        <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={<TrendingUp className="h-4 w-4" />} accentColor="bg-teal-500/10 text-teal-500" loading={isLoading} />
      </div>

      {isError && <ErrorState error="Failed to load attendance" onRetry={refetch} />}

      {/* Weekly Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Last 7 Days — Attendance Overview</CardTitle>
          <CardDescription>Daily attendance session counts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-3 h-40">
            {last7Days.map(({ date, label, count, present }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex flex-col items-center gap-1 justify-end" style={{ height: "120px" }}>
                  <span className="text-xs text-muted-foreground font-medium">{count}</span>
                  <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: "96px" }}>
                    {count > 0 && (
                      <>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(present / maxCount) * 80}px` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="w-full bg-green-500/80 rounded-t"
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${((count - present) / maxCount) * 80}px` }}
                          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                          className="w-full bg-red-400/60 rounded-b"
                        />
                      </>
                    )}
                    {count === 0 && (
                      <div className="w-full h-2 bg-muted rounded" />
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 justify-end">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-3 h-3 rounded bg-green-500/80" /> Present</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-3 h-3 rounded bg-red-400/60" /> Absent</div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Records</CardTitle>
          <CardDescription>All recorded attendance sessions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton rows={8} cols={4} /></div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No attendance records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-b-xl">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40">
                  <th className="text-left p-4 font-medium text-muted-foreground">Student ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Class ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr></thead>
                <tbody>
                  {records.slice(0, 50).map((rec, idx) => (
                    <tr key={rec.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="p-4 font-mono text-xs text-muted-foreground">{rec.student_id.slice(0, 12)}…</td>
                      <td className="p-4 font-mono text-xs text-muted-foreground">{rec.class_id.slice(0, 12)}…</td>
                      <td className="p-4 text-xs">{rec.date ? format(new Date(rec.date), "MMM d, yyyy") : "—"}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${rec.status === "present" ? "bg-green-500/10 text-green-600" : rec.status === "absent" ? "bg-red-500/10 text-red-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                          {rec.status === "present" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
