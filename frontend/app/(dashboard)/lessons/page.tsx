"use client";

import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLessons, useCreateLesson, useDeleteLesson, useClasses } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, Plus, Search, Calendar, Trash2, Edit3, Eye, Clock, PlayCircle,
  FileText, Sparkles, AlertCircle, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";

export default function LessonsPage() {
  const { user } = useAuthStore();
  const role = user?.role || "Student";
  const isEdu = role === "Teacher" || role === "Platform Admin" || role === "Institution Admin";

  const searchParams = useSearchParams();
  const classIdParam = searchParams.get("classId") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(classIdParam);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formClassId, setFormClassId] = useState(classIdParam);

  // Fetch data
  const { data: lessonsData, isLoading: lessonsLoading, refetch } = useLessons(100);
  const { data: classesData } = useClasses(100);
  const createLessonMutation = useCreateLesson();
  const deleteLessonMutation = useDeleteLesson();

  const lessons = useMemo(() => {
    return lessonsData?.pages?.flatMap(p => p.data) || [];
  }, [lessonsData]);

  const classes = useMemo(() => {
    return classesData?.pages?.flatMap(p => p.data) || [];
  }, [classesData]);

  // Filters logic
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (l.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchClass = selectedClassId && selectedClassId !== "all" ? l.class_id === selectedClassId : true;
      return matchSearch && matchClass;
    });
  }, [lessons, searchQuery, selectedClassId]);

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formClassId) return;

    await createLessonMutation.mutateAsync({
      class_id: formClassId,
      title: formTitle,
      description: formDesc,
      content: formContent,
      scheduled_time: new Date().toISOString(),
    });

    setIsCreateOpen(false);
    setFormTitle("");
    setFormDesc("");
    setFormContent("");
  };

  const handleDeleteLesson = async (id: string) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      await deleteLessonMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Lessons Directory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Access study schedules, explaining resources, and learning summary indices.
          </p>
        </div>

        {isEdu && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger
              render={
                <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs rounded-xl h-9">
                  <Plus className="h-4 w-4" /> Create Lesson
                </Button>
              }
            />
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Lesson</DialogTitle>
                <DialogDescription>Add a new curriculum lesson explanation unit.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLesson} className="space-y-4 pt-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold">Assign to Module (Class)</label>
                  <Select value={formClassId} onValueChange={setFormClassId}>
                    <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Choose Module" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name || `Class ${c.grade || 'N/A'} - ${c.section || 'N/A'}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Lesson Title</label>
                  <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Introduction to Chloroplasts" className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Overview Description</label>
                  <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Summary of what the lesson covers." className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Lesson Explanatory Text Content (Markdown supported)</label>
                  <Textarea value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="Write details here..." className="text-xs min-h-[120px]" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search lessons..." className="pl-9 text-xs h-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[180px] text-xs h-9"><SelectValue placeholder="All Modules" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name || `Class ${c.grade || 'N/A'} - ${c.section || 'N/A'}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lessons grid */}
      {lessonsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredLessons.length === 0 ? (
        <Card className="border-dashed p-12 text-center max-w-md mx-auto">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-sm">No lessons found</p>
          <p className="text-xs text-muted-foreground mt-1">Check filters or create a new lesson for this module.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLessons.map((l) => {
            const classObj = classes.find(c => c.id === l.class_id);
            return (
              <motion.div key={l.id} whileHover={{ x: 5 }} transition={{ duration: 0.1 }}>
                <Card className="border-border/60 hover:border-teal-500/30 transition-all bg-card shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{l.title}</span>
                      <Badge className="bg-teal-500/10 text-teal-600 border-none text-[9px] font-bold">
                        {classObj ? (classObj.name || `Class ${classObj.grade || 'N/A'} - ${classObj.section || 'N/A'}`) : "Module Track"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl line-clamp-1">
                      {l.description || "No overview provided. Click view to read full explanation text."}
                    </p>
                    {l.scheduled_time && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {format(new Date(l.scheduled_time), "PPP")}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button size="sm" className="w-full text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-1 flex-grow sm:flex-grow-0" asChild>
                      <Link href={`/lessons/${l.id}`}>
                        <PlayCircle className="h-3.5 w-3.5" /> Start Lesson
                      </Link>
                    </Button>
                    {isEdu && (
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl hover:bg-red-500/10" onClick={() => handleDeleteLesson(l.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
