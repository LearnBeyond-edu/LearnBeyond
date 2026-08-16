"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Pencil, Trash2, Users, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useClass, useDeleteClass, useLessons } from "@/hooks/useSchool";
import { PageHeader, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format as fmt } from "date-fns";

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: cls, isLoading, isError } = useClass(id);
  const { mutate: deleteClass, isPending: isDeleting } = useDeleteClass();
  const { data: lessonsData } = useLessons();
  const [showDelete, setShowDelete] = useState(false);

  const allLessons = lessonsData?.pages.flatMap((p) => p.data) ?? [];
  const classLessons = allLessons.filter((l) => l.class_id === id);

  if (isError) return <ErrorState error="Class not found." />;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/school/classes">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        {isLoading ? <Skeleton className="h-7 w-48" /> : (
          <PageHeader
            title={cls?.name ?? ""}
            subtitle="Class Details"
            actions={
              <div className="flex gap-2">
                <Link href={`/school/classes/${id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                </Link>
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setShowDelete(true)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            }
          />
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex-1 grid sm:grid-cols-2 gap-4">
                <InfoItem label="Class Name" value={cls?.name ?? "—"} />
                <InfoItem label="Description" value={cls?.description ?? "—"} />
                <InfoItem label="Teacher ID" value={cls?.teacher_id ? cls.teacher_id.slice(0, 16) + "…" : "Not assigned"} />
                <InfoItem label="Created" value={cls?.created_at ? format(new Date(cls.created_at), "PPP") : "—"} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons ({classLessons.length})</TabsTrigger>
          <TabsTrigger value="info">Information</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="mt-4">
          {classLessons.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No lessons for this class yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classLessons.map((lesson) => (
                <Card key={lesson.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><FileText className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">{lesson.description ?? "—"}</p>
                    </div>
                    {lesson.scheduled_time && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {fmt(new Date(lesson.scheduled_time), "MMM d, h:mm a")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Institution ID: <span className="font-mono font-medium text-foreground">{cls?.institution_id}</span></p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>Delete <strong>{cls?.name}</strong>? This is a soft delete.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" disabled={isDeleting} onClick={() => deleteClass(id, { onSuccess: () => router.push("/school/classes") })}>
              {isDeleting ? "Deleting…" : "Confirm Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border bg-muted/30">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-medium mt-0.5 break-all">{value}</p>
    </div>
  );
}
