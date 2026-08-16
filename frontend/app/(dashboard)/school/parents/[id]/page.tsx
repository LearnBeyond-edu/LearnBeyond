"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Heart, Phone, Mail, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useParent } from "@/hooks/useSchool";
import { PageHeader, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ParentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: parent, isLoading, isError } = useParent(id);

  const fullName = parent
    ? [parent.first_name, parent.last_name].filter(Boolean).join(" ") || `Parent ${id.slice(0, 6)}`
    : "";

  if (isError) return <ErrorState error="Parent not found" />;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/school/parents">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        {isLoading ? <Skeleton className="h-7 w-40" /> : <PageHeader title={fullName} subtitle="Parent Profile" />}
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : (
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl font-bold bg-pink-500/20 text-pink-600">
                  {(parent?.first_name?.[0] ?? "P").toUpperCase()}{(parent?.last_name?.[0] ?? "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: <Users className="h-4 w-4" />, label: "Full Name", value: fullName },
                  { icon: <Phone className="h-4 w-4" />, label: "Phone", value: parent?.phone_number ?? "—" },
                  { icon: <Mail className="h-4 w-4" />, label: "User ID", value: (parent?.user_id.slice(0, 16) ?? "") + "…" },
                  { icon: <Calendar className="h-4 w-4" />, label: "Registered", value: parent?.created_at ? format(new Date(parent.created_at), "PPP") : "—" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl border bg-muted/30">
                    <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
