"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Users, Phone, Mail, Calendar, Brain } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useTherapist } from "@/hooks/useSchool";
import { PageHeader, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function TherapistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: therapist, isLoading, isError } = useTherapist(id);

  const fullName = therapist
    ? [therapist.first_name, therapist.last_name].filter(Boolean).join(" ") || `Therapist ${id.slice(0, 6)}`
    : "";

  if (isError) return <ErrorState error="Therapist not found" />;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/school/therapists">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        {isLoading ? <Skeleton className="h-7 w-40" /> : <PageHeader title={fullName} subtitle="Therapist Profile" />}
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : (
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl font-bold bg-orange-500/20 text-orange-600">
                  {(therapist?.first_name?.[0] ?? "T").toUpperCase()}{(therapist?.last_name?.[0] ?? "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: <Users className="h-4 w-4" />, label: "Full Name", value: fullName },
                  { icon: <Phone className="h-4 w-4" />, label: "Phone", value: therapist?.phone_number ?? "—" },
                  { icon: <Mail className="h-4 w-4" />, label: "User ID", value: therapist?.user_id.slice(0, 16) + "…" },
                  { icon: <Calendar className="h-4 w-4" />, label: "Joined", value: therapist?.created_at ? format(new Date(therapist.created_at), "PPP") : "—" },
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
      
      {/* Additional Therapist Details can go here later */}
      <Card>
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Therapy Sessions & Case Load</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                Additional modules for managing specific therapy sessions, case notes, and student progress mapping are coming in the next update.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
