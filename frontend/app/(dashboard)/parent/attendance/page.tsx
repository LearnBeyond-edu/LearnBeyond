"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useAttendance, useStudents } from "@/hooks/useSchool";
import { PageHeader, EmptyState } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle, XCircle, Clock, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { flattenInfinitePages, getDisplayName } from "@/lib/parent";

export default function ParentAttendancePage() {
  const { data: attendanceData, isLoading } = useAttendance();
  const { data: studentsData } = useStudents(100);
  const [selectedChildId, setSelectedChildId] = useState("");

  const attendance = flattenInfinitePages(attendanceData);
  const students = flattenInfinitePages(studentsData);

  useEffect(() => {
    if (!selectedChildId && students[0]?.id) setSelectedChildId(students[0].id);
  }, [selectedChildId, students]);

  const selectedChild = students.find((child) => child.id === selectedChildId) ?? students[0];
  const childAttendance = selectedChild ? attendance.filter((entry) => entry.student_id === selectedChild.id) : attendance;

  const presentCount = childAttendance.filter((entry) => entry.status === "present").length;
  const absentCount = childAttendance.filter((entry) => entry.status === "absent").length;
  const lateCount = childAttendance.filter((entry) => entry.status === "late").length;
  const rate = childAttendance.length ? Math.round((presentCount / childAttendance.length) * 100) : 0;

  const weeklyTrend = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const dayKey = format(day, "yyyy-MM-dd");
    const entries = childAttendance.filter((entry) => format(new Date(entry.date), "yyyy-MM-dd") === dayKey);
    return { label: format(day, "EEE"), rate: entries.length ? Math.round((entries.filter((entry) => entry.status === "present").length / entries.length) * 100) : 0 };
  }), [childAttendance]);

  const monthlyTrend = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - index));
    const monthKey = format(month, "yyyy-MM");
    const entries = childAttendance.filter((entry) => format(new Date(entry.date), "yyyy-MM") === monthKey);
    return { label: format(month, "MMM"), rate: entries.length ? Math.round((entries.filter((entry) => entry.status === "present").length / entries.length) * 100) : 0 };
  }), [childAttendance]);

  const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    present: { label: "Present", cls: "bg-emerald-500/10 text-emerald-600", icon: <CheckCircle className="h-3.5 w-3.5" /> },
    absent: { label: "Absent", cls: "bg-red-500/10 text-red-600", icon: <XCircle className="h-3.5 w-3.5" /> },
    late: { label: "Late", cls: "bg-amber-500/10 text-amber-600", icon: <Clock className="h-3.5 w-3.5" /> },
    excused: { label: "Excused", cls: "bg-blue-500/10 text-blue-600", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Daily, weekly, and monthly attendance insights for linked children"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {students.slice(0, 5).map((child) => (
              <Button key={child.id} variant={selectedChild?.id === child.id ? "default" : "outline"} size="sm" onClick={() => setSelectedChildId(child.id)}>
                {getDisplayName(child)}
              </Button>
            ))}
          </div>
        }
      />

      {!students.length ? (
        <EmptyState icon={<ClipboardCheck className="h-14 w-14" />} title="No attendance data" description="Attendance records will appear once the backend returns authorized student data." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Overall rate", value: `${rate}%`, tone: "text-emerald-600" },
              { label: "Present", value: presentCount, tone: "text-emerald-600" },
              { label: "Absent", value: absentCount, tone: "text-red-500" },
              { label: "Late", value: lateCount, tone: "text-amber-500" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border/60">
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.tone}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Attendance trend</CardTitle>
                <CardDescription>Weekly and monthly overview for {selectedChild ? getDisplayName(selectedChild) : "the selected child"}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 md:grid-cols-7">
                  {weeklyTrend.map((item) => (
                    <div key={item.label} className="rounded-2xl border p-3 text-center">
                      <div className="flex h-28 items-end"><div className="w-full rounded-full bg-blue-500/20" style={{ height: `${Math.max(20, item.rate)}%` }} /></div>
                      <p className="mt-2 text-[10px] font-semibold uppercase text-muted-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.rate}%</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-6">
                  {monthlyTrend.map((item) => (
                    <div key={item.label} className="rounded-2xl border p-3 text-center">
                      <div className="flex h-28 items-end"><div className="w-full rounded-full bg-emerald-500/20" style={{ height: `${Math.max(20, item.rate)}%` }} /></div>
                      <p className="mt-2 text-[10px] font-semibold uppercase text-muted-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.rate}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-rose-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4 text-rose-500" /> Attendance heat</CardTitle>
                <CardDescription>Heatmap style overview based on the available daily records.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, index) => {
                  const day = new Date();
                  day.setDate(day.getDate() - (34 - index));
                  const key = format(day, "yyyy-MM-dd");
                  const entries = childAttendance.filter((entry) => format(new Date(entry.date), "yyyy-MM-dd") === key);
                  const percent = entries.length ? Math.round((entries.filter((entry) => entry.status === "present").length / entries.length) * 100) : 0;
                  return <div key={key} className="aspect-square rounded-md border" title={`${format(day, "PP")}: ${percent}%`} style={{ backgroundColor: percent > 80 ? "rgba(16,185,129,0.25)" : percent > 50 ? "rgba(59,130,246,0.18)" : percent > 0 ? "rgba(251,191,36,0.2)" : "rgba(148,163,184,0.08)" }} />;
                })}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Daily attendance log</CardTitle>
              <CardDescription>All recorded attendance entries for the selected child.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">{[1,2,3].map((index) => <Skeleton key={index} className="h-12 w-full" />)}</div>
              ) : childAttendance.length === 0 ? (
                <div className="p-8"><EmptyState icon={<ClipboardCheck className="h-10 w-10" />} title="No attendance records" description="Attendance will appear here once teachers start recording it." /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        <th className="text-left p-4 font-semibold text-muted-foreground">Date</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Record</th>
                      </tr>
                    </thead>
                    <tbody>
                      {childAttendance.slice(0, 30).map((record) => {
                        const cfg = statusConfig[record.status] ?? statusConfig.present;
                        return (
                          <tr key={record.id} className="border-b last:border-0 hover:bg-muted/10">
                            <td className="p-4 text-muted-foreground">{format(new Date(record.date), "MMM d, yyyy")}</td>
                            <td className="p-4"><span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.icon} {cfg.label}</span></td>
                            <td className="p-4 font-medium">{selectedChild ? getDisplayName(selectedChild) : record.student_id}</td>
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
