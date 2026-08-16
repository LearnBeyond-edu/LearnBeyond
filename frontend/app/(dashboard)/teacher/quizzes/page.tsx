"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, CheckSquare, Calendar, ArrowRight, Trash2, Clock } from "lucide-react";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { useQuizzes, useDeleteQuiz, useClasses } from "@/hooks/useSchool";
import { PageHeader, EmptyState, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Quiz } from "@/types/school";
import { useAuthStore } from "@/store/useAuthStore";

export default function TeacherQuizzesPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useQuizzes();
  const { mutate: deleteQuiz, isPending: isDeleting } = useDeleteQuiz();
  
  const { data: classesData } = useClasses(100);
  const allClasses = classesData?.pages.flatMap(p => p.data) ?? [];
  const myClassIds = allClasses.map(c => c.id);

  const allQuizzes = data?.pages.flatMap((p) => p.data) ?? [];
  
  // Filter for quizzes in my classes
  const myQuizzes = allQuizzes.filter(q => myClassIds.includes(q.class_id));

  const filtered = myQuizzes.filter((q) =>
    [q.title, q.description].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-7xl">
      <PageHeader
        title="Quizzes"
        subtitle={`Manage ${myQuizzes.length} quiz${myQuizzes.length !== 1 ? "zes" : ""} across your classes`}
        actions={
          <Link href="/teacher/quizzes/create">
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Create Quiz</Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search quizzes..." className="pl-9 bg-card shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Content */}
      {isError ? (
        <ErrorState error="Failed to load quizzes" onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          icon={<CheckSquare className="h-14 w-14" />} 
          title="No quizzes found" 
          description={search ? "Try a different search." : "You haven't created any quizzes yet."} 
          action={!search && <Link href="/teacher/quizzes/create"><Button>Create Quiz</Button></Link>} 
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quiz) => {
            const cls = allClasses.find(c => c.id === quiz.class_id);
            const isOverdue = quiz.due_date && isPast(new Date(quiz.due_date));

            return (
              <Card key={quiz.id} className="group hover:shadow-md transition-all border-border/60 flex flex-col h-full">
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                      <CheckSquare className="h-5 w-5 text-orange-500" />
                    </div>
                    {isOverdue ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 uppercase">Closed</span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 uppercase">Open</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm truncate">{quiz.title}</h3>
                    <p className="text-xs text-orange-600 font-medium truncate mb-2">{cls?.name || (cls ? `Class ${cls.grade || 'N/A'} - Section ${cls.section || 'N/A'}` : "Unknown Class")}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 h-8">
                      {quiz.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 mb-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted/40 p-2 rounded-lg">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Due: {quiz.due_date ? format(new Date(quiz.due_date), "MMM d") : "No limit"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/40 p-2 rounded-lg">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{quiz.time_limit ? `${quiz.time_limit} mins` : "Untimed"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t mt-auto">
                    <Link href={`/teacher/quizzes/${quiz.id}/review`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full gap-2 bg-orange-600 hover:bg-orange-700 border-none text-white">Review Responses <ArrowRight className="h-3 w-3" /></Button>
                    </Link>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive shrink-0" onClick={() => setDeleteTarget(quiz)}>
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
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>Delete quiz <strong>{deleteTarget?.title}</strong>? This action is permanent.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={isDeleting} onClick={() => deleteQuiz(deleteTarget!.id, { onSuccess: () => setDeleteTarget(null) })}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
