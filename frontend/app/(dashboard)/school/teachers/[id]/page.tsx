"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Users, Phone, Mail, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useTeacher, useClasses } from "@/hooks/useSchool";
import { PageHeader, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: teacher, isLoading, isError } = useTeacher(id);
  const { data: classesData } = useClasses(100);

  const allClasses = classesData?.pages.flatMap((p) => p.data) ?? [];
  const assignedClasses = teacher?.user_id ? allClasses.filter((c) => c.class_teacher_id === teacher.user_id) : [];

  const fullName = teacher
    ? [teacher.first_name, teacher.last_name].filter(Boolean).join(" ") || `Teacher ${id.slice(0, 6)}`
    : "";

  if (isError) return <ErrorState error="Teacher not found" />;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/school/teachers">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        {isLoading ? <Skeleton className="h-7 w-40" /> : <PageHeader title={fullName} subtitle="Teacher Profile" />}
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : (
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl font-bold bg-violet-500/20 text-violet-600">
                  {(teacher?.first_name?.[0] ?? "T").toUpperCase()}{(teacher?.last_name?.[0] ?? "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: <Users className="h-4 w-4" />, label: "Full Name", value: fullName },
                  { icon: <Phone className="h-4 w-4" />, label: "Phone", value: teacher?.phone_number ?? "—" },
                  { icon: <Mail className="h-4 w-4" />, label: "User ID", value: teacher?.user_id.slice(0, 16) + "…" },
                  { icon: <Calendar className="h-4 w-4" />, label: "Joined", value: teacher?.created_at ? format(new Date(teacher.created_at), "PPP") : "—" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl border bg-muted/30">
                    <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Classes */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Assigned Classes ({assignedClasses.length})</CardTitle></CardHeader>
        <CardContent>
          {assignedClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No classes assigned to this teacher yet.</p>
          ) : (
            <div className="space-y-2">
              {assignedClasses.map((cls) => (
                <Link href={`/school/classes/${cls.id}`} key={cls.id}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Class {cls.grade} - Section {cls.section}</p>
                      <p className="text-xs text-muted-foreground">Academic Year: {cls.academic_year}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
