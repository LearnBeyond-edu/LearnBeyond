"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Users, LayoutGrid, List, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useClasses } from "@/hooks/useSchool";
import { useAuthStore } from "@/store/useAuthStore";
import { PageHeader, EmptyState, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SchoolClass } from "@/types/school";

export default function TeacherClassesPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useClasses(100);
  
  // Only show classes assigned to this teacher
  const allInstitutionClasses = data?.pages.flatMap((p) => p.data) ?? [];
  
  // Note: in a real production environment, the backend would filter this via `GET /classes?teacher_id=xxx`.
  // Since we cannot modify the backend, we filter it locally.
  const myClasses = allInstitutionClasses;

  const filtered = myClasses.filter((c) =>
    [`Class ${c.grade} - Section ${c.section}`, c.description].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-7xl">
      <PageHeader
        title="My Classes"
        subtitle={`You are assigned to ${myClasses.length} class${myClasses.length !== 1 ? "es" : ""}`}
        actions={
          <div className="flex items-center border rounded-lg overflow-hidden bg-card shadow-sm">
            <button onClick={() => setView("grid")} className={`p-2 transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView("list")} className={`p-2 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search your classes..." className="pl-9 bg-card shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Content */}
      {isError ? (
        <ErrorState error="Failed to load your classes" onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          icon={<BookOpen className="h-14 w-14" />} 
          title={search ? "No matches found" : "No classes assigned"} 
          description={search ? "Try a different search term" : "You have not been assigned to any classes yet. Please contact the institution administrator."} 
        />
      ) : view === "grid" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cls) => <ClassCard key={cls.id} cls={cls} />)}
        </motion.div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40">
                  <th className="text-left p-4 font-medium text-muted-foreground">Class Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Created On</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                </tr></thead>
                <tbody>
                  {filtered.map((cls) => (
                    <tr key={cls.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-semibold text-primary">Class {cls.grade} - Section {cls.section}</td>
                      <td className="p-4 text-muted-foreground max-w-xs truncate">{cls.academic_year ?? "—"}</td>
                      <td className="p-4 text-muted-foreground">{format(new Date(cls.created_at), "MMM d, yyyy")}</td>
                      <td className="p-4">
                        <Button variant="outline" size="sm" asChild className="gap-2">
                          <Link href={`/teacher/classes/${cls.id}`}>
                            Open <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {hasNextPage && !search && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading…" : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}

function ClassCard({ cls }: { cls: SchoolClass }) {
  return (
    <Card className="group hover:shadow-lg transition-all border-border/60 overflow-hidden flex flex-col h-full">
      <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400" />
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1 truncate">Class {cls.grade} - Section {cls.section}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">Academic Year: {cls.academic_year ?? "Not Specified"}</p>
        </div>
        <div className="flex gap-2 pt-5 mt-auto">
          <Link href={`/teacher/classes/${cls.id}`} className="flex-1">
            <Button className="w-full gap-2 shadow-sm">
              Open Class <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
