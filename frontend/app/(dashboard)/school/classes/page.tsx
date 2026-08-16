"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, BookOpen, Pencil, Trash2, Users, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useClasses, useDeleteClass } from "@/hooks/useSchool";
import { PageHeader, EmptyState, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { SchoolClass } from "@/types/school";

export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [deleteTarget, setDeleteTarget] = useState<SchoolClass | null>(null);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useClasses();
  const { mutate: deleteClass, isPending: isDeleting } = useDeleteClass();

  const allClasses = data?.pages.flatMap((p) => p.data) ?? [];
  const filtered = allClasses.filter((c) =>
    [c.name, c.description].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-7xl">
      <PageHeader
        title="Classes"
        subtitle={`${allClasses.length} class${allClasses.length !== 1 ? "es" : ""} in your institution`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
            <Link href="/school/classes/create">
              <Button className="gap-1.5"><Plus className="h-4 w-4" /> New Class</Button>
            </Link>
          </div>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search classes..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Content */}
      {isError ? (
        <ErrorState error="Failed to load classes" onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-14 w-14" />} title="No classes found" description={search ? "Try a different search" : "Create your first class to get started."} action={!search && <Link href="/school/classes/create"><Button>Create Class</Button></Link>} />
      ) : view === "grid" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cls) => <ClassCard key={cls.id} cls={cls} onDelete={() => setDeleteTarget(cls)} />)}
        </motion.div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40">
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Teacher</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Created</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map((cls) => (
                    <tr key={cls.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{cls.name}</td>
                      <td className="p-4 text-muted-foreground max-w-xs truncate">{cls.description ?? "—"}</td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{cls.teacher_id ? cls.teacher_id.slice(0, 8) + "…" : "—"}</td>
                      <td className="p-4 text-muted-foreground">{format(new Date(cls.created_at), "MMM d, yyyy")}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link href={`/school/classes/${cls.id}/edit`}><Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /></Button></Link>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteTarget(cls)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
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
        <div className="text-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading…" : "Load More"}
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>Delete <strong>{deleteTarget?.name}</strong>? This is a soft delete — data is retained.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={isDeleting} onClick={() => deleteClass(deleteTarget!.id, { onSuccess: () => setDeleteTarget(null) })}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClassCard({ cls, onDelete }: { cls: SchoolClass; onDelete: () => void }) {
  return (
    <Card className="group hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{cls.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{cls.description ?? "No description"}</p>
          </div>
        </div>
        <div className="space-y-1.5 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>Teacher: {cls.teacher_id ? cls.teacher_id.slice(0, 8) + "…" : "Not assigned"}</span>
          </div>
          <p>Created {format(new Date(cls.created_at), "MMM d, yyyy")}</p>
        </div>
        <div className="flex gap-2 border-t pt-3">
          <Link href={`/school/classes/${cls.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">View</Button>
          </Link>
          <Link href={`/school/classes/${cls.id}/edit`}>
            <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /></Button>
          </Link>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
