"use client";

import { useStaff, useStudents, useParents, useTherapists } from "@/hooks/usePlatform";
import { Users, Search, BookOpen, Heart, Brain } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { PageHeader, EmptyState, ErrorState, TableSkeleton } from "@/components/common/AdminUI";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Role = "teachers" | "students" | "parents" | "therapists";

const TABS: { key: Role; label: string; icon: React.ElementType }[] = [
  { key: "teachers", label: "Teachers", icon: BookOpen },
  { key: "students", label: "Students", icon: Users },
  { key: "parents", label: "Parents", icon: Heart },
  { key: "therapists", label: "Therapists", icon: Brain },
];

export default function UsersPage() {
  const [tab, setTab] = useState<Role>("teachers");
  const [search, setSearch] = useState("");

  const { data: staffData, isLoading: ls, isError: es, refetch: rs } = useStaff();
  const { data: studentsData, isLoading: lst, isError: est, refetch: rst } = useStudents();
  const { data: parentsData, isLoading: lp, isError: ep, refetch: rp } = useParents();
  const { data: therapistsData, isLoading: lt, isError: et, refetch: rt } = useTherapists();

  const tableMap: Record<Role, { data: any[]; isLoading: boolean; isError: boolean; refetch: () => void }> = {
    teachers: { data: staffData?.data ?? [], isLoading: ls, isError: es, refetch: rs },
    students: { data: studentsData?.data ?? [], isLoading: lst, isError: est, refetch: rst },
    parents: { data: parentsData?.data ?? [], isLoading: lp, isError: ep, refetch: rp },
    therapists: { data: therapistsData?.data ?? [], isLoading: lt, isError: et, refetch: rt },
  };

  const current = tableMap[tab];
  const filtered = current.data.filter((u) =>
    u.user_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl space-y-5">
      <PageHeader title="User Management" subtitle="Browse all platform users by role" />

      {/* Role Tabs */}
      <div className="flex gap-1.5 bg-muted/50 rounded-xl p-1.5 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSearch(""); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className="text-xs bg-muted rounded px-1">
              {tableMap[key].data.length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by user ID..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {current.isError ? (
        <ErrorState error={`Failed to load ${tab}`} onRetry={current.refetch} />
      ) : current.isLoading ? (
        <Card><CardContent className="p-6"><TableSkeleton rows={8} cols={3} /></CardContent></Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-14 w-14" />} title={`No ${tab} found`} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">User ID</th>
                    {tab !== "parents" && (
                      <th className="text-left p-4 font-medium text-muted-foreground">Institution</th>
                    )}
                    <th className="text-left p-4 font-medium text-muted-foreground">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => (
                    <tr key={u.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="p-4 font-mono text-xs text-muted-foreground">{u.id.slice(0, 8)}…</td>
                      <td className="p-4 font-mono text-xs">{u.user_id.slice(0, 8)}…</td>
                      {tab !== "parents" && (
                        <td className="p-4 text-xs text-muted-foreground">{u.institution_id ? u.institution_id.slice(0, 8) + "…" : "—"}</td>
                      )}
                      <td className="p-4 text-xs text-muted-foreground">
                        {format(new Date(u.created_at), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
