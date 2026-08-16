"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, BookOpen, Pencil, Trash2, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useLessons, useDeleteLesson, useClasses } from "@/hooks/useSchool";
import { PageHeader, EmptyState, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lesson } from "@/types/school";
import { useAuthStore } from "@/store/useAuthStore";

export default function TeacherLessonsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useLessons(100);
  const { mutate: deleteLesson, isPending: isDeleting } = useDeleteLesson();
  
  const { data: classesData } = useClasses(100);
  const allClasses = classesData?.pages.flatMap(p => p.data) ?? [];
  const myClassIds = allClasses.map(c => c.id);

  const allLessons = data?.pages.flatMap((p) => p.data) ?? [];
  
  // Filter for lessons created by this teacher
  const myLessons = allLessons.filter(l => l.created_by === user?.id || myClassIds.includes(l.class_id));

  const filtered = myLessons.filter((l) =>
    [l.title, l.description].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-7xl">
      <PageHeader
        title="Lessons Dashboard"
        subtitle={`${myLessons.length} lesson${myLessons.length !== 1 ? "s" : ""} across your classes`}
        actions={
          <Link href="/teacher/lessons/create">
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Create Lesson</Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search lessons..." className="pl-9 bg-card shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Content */}
      {isError ? (
        <ErrorState error="Failed to load lessons" onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          icon={<FileText className="h-14 w-14" />} 
          title="No lessons found" 
          description={search ? "Try a different search." : "You haven't created any lessons yet."} 
          action={!search && <Link href="/teacher/lessons/create"><Button>Create Lesson</Button></Link>} 
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lesson) => {
            const cls = allClasses.find(c => c.id === lesson.class_id);
            return (
              <Card key={lesson.id} className="group hover:shadow-md transition-all border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{lesson.title}</h3>
                      <p className="text-xs text-primary font-medium truncate">{cls?.name || "Unknown Class"}</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">
                    {lesson.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-muted/40 p-2 rounded-lg">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>{lesson.scheduled_time ? format(new Date(lesson.scheduled_time), "MMM d, yyyy 'at' h:mm a") : "Not scheduled"}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Link href={`/teacher/lessons/${lesson.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                    </Link>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive shrink-0" onClick={() => setDeleteTarget(lesson)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}

      {/* Load More */}
      {hasNextPage && !search && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading…" : "Load More"}
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>Delete <strong>{deleteTarget?.title}</strong>? This action will remove the lesson from the class.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={isDeleting} onClick={() => deleteLesson(deleteTarget!.id, { onSuccess: () => setDeleteTarget(null) })}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
