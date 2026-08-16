"use client";

import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAssignments, useCreateAssignment, useDeleteAssignment, useClasses } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Plus, Search, Calendar, Trash2, CheckCircle, Clock,
  FileCheck, Sparkles, Clipboard, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";

export default function AssignmentsPage() {
  const { user } = useAuthStore();
  const role = user?.role || "Student";
  const isEdu = role === "Teacher" || role === "Platform Admin" || role === "Institution Admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formClassId, setFormClassId] = useState("");

  // Fetch data
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments();
  const { data: classesData } = useClasses(100);
  const createAssignmentMutation = useCreateAssignment();
  const deleteAssignmentMutation = useDeleteAssignment();

  const assignments = useMemo(() => {
    return assignmentsData?.pages?.flatMap(p => p.data) || [];
  }, [assignmentsData]);

  const classes = useMemo(() => {
    return classesData?.pages?.flatMap(p => p.data) || [];
  }, [classesData]);

  // Filters logic
  const filteredAssignments = useMemo(() => {
    return assignments.filter(asm => {
      const matchSearch = asm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (asm.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchClass = selectedClassId ? asm.class_id === selectedClassId : true;
      return matchSearch && matchClass;
    });
  }, [assignments, searchQuery, selectedClassId]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formClassId) return;

    await createAssignmentMutation.mutateAsync({
      class_id: formClassId,
      title: formTitle,
      description: formDesc,
      due_date: formDueDate ? new Date(formDueDate).toISOString() : new Date(Date.now() + 86400000 * 3).toISOString(),
    });

    setIsCreateOpen(false);
    setFormTitle("");
    setFormDesc("");
    setFormDueDate("");
  };

  const handleDeleteAssignment = async (id: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      await deleteAssignmentMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <FileText className="w-32 h-32 text-teal-300 transform rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold font-heading tracking-tight text-white drop-shadow-md">
              Assignments <span className="text-teal-400">&</span> Coursework
            </h1>
            <p className="text-sm text-teal-100 max-w-xl leading-relaxed">
              Submit your coursework, view upcoming deadlines, and track your grading feedback in real time.
            </p>
          </div>

        {isEdu && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger
              render={
                <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs rounded-xl h-9">
                  <Plus className="h-4 w-4" /> Create Assignment
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Homework Assignment</DialogTitle>
                <DialogDescription>Assign a new coursework activity with rubrics and due dates.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAssignment} className="space-y-4 pt-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold">Assign to Module (Class)</label>
                  <Select value={formClassId} onValueChange={setFormClassId}>
                    <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Choose Module" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Assignment Title</label>
                  <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Lab Report: Cell Membranes" className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Instructions & Overview</label>
                  <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="What students should do, write, or draw." className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Due Date</label>
                  <Input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className="text-xs h-9" />
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
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assignments..." className="pl-9 text-xs h-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[180px] text-xs h-9"><SelectValue placeholder="All Modules" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Modules</SelectItem>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {assignmentsLoading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 w-full bg-muted/40 animate-pulse rounded-2xl border border-border/50" />
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="border-dashed p-16 text-center max-w-lg mx-auto bg-card/50 backdrop-blur-sm rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clipboard className="h-8 w-8" />
          </div>
          <p className="font-bold text-lg text-foreground">No assignments due</p>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Excellent work! You are completely caught up on your course submissions.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredAssignments.map((asm, idx) => {
            const classObj = classes.find(c => c.id === asm.class_id);
            return (
              <motion.div 
                key={asm.id} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <Card className="group border-border/50 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 bg-card rounded-2xl overflow-hidden h-full flex flex-col relative">
                  {/* Decorative accent bar */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-500/10 text-teal-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-foreground line-clamp-1">{asm.title}</h3>
                          <Badge className="bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 border-none text-[10px] font-bold mt-1.5 transition-colors">
                            {classObj ? classObj.name : "Curriculum Track"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-5 flex-1">
                      {asm.description || "Review the provided instructions carefully to prepare your submission materials."}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        {asm.due_date ? (
                          <Badge variant="outline" className="bg-red-500/5 text-red-600 border-red-200/50 text-[10px] font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg">
                            <Calendar className="h-3 w-3" /> Due {format(new Date(asm.due_date), "MMM d")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg">
                            <Clock className="h-3 w-3" /> No deadline
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {isEdu && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500" onClick={() => handleDeleteAssignment(asm.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href={`/assignments/${asm.id}`}>
                          <Button size="sm" className="h-8 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white rounded-xl text-xs font-bold gap-1.5 px-4 shadow-sm group-hover:shadow-md transition-all">
                            Submit <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
