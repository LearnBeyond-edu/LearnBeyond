"use client";

import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuizzes, useCreateQuiz, useDeleteQuiz, useClasses } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity, Plus, Search, Calendar, Trash2, Clock, PlayCircle, HelpCircle,
  Trophy, BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";

export default function QuizzesPage() {
  const { user } = useAuthStore();
  const role = user?.role || "Student";
  const isEdu = role === "Teacher" || role === "Platform Admin" || role === "Institution Admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formTimeLimit, setFormTimeLimit] = useState("15");
  const [formDueDate, setFormDueDate] = useState("");
  const [formClassId, setFormClassId] = useState("");

  // Fetch data
  const { data: quizzesData, isLoading: quizzesLoading } = useQuizzes(50);
  const { data: classesData } = useClasses(100);
  const createQuizMutation = useCreateQuiz();
  const deleteQuizMutation = useDeleteQuiz();

  const quizzes = useMemo(() => {
    return quizzesData?.pages?.flatMap(p => p.data) || [];
  }, [quizzesData]);

  const classes = useMemo(() => {
    return classesData?.pages?.flatMap(p => p.data) || [];
  }, [classesData]);

  // Filters logic
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      const matchSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchClass = selectedClassId ? q.class_id === selectedClassId : true;
      return matchSearch && matchClass;
    });
  }, [quizzes, searchQuery, selectedClassId]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formClassId) return;

    await createQuizMutation.mutateAsync({
      class_id: formClassId,
      title: formTitle,
      description: formDesc,
      time_limit: parseInt(formTimeLimit),
      due_date: formDueDate ? new Date(formDueDate).toISOString() : new Date(Date.now() + 86400000 * 3).toISOString(),
      questions: [
        { type: "mcq", question: "What is the primary function of Mitochondria?", options: ["Stores DNA", "Generates ATP Energy", "Synthesizes proteins", "Cleans toxins"], answer: "Generates ATP Energy" },
        { type: "tf", question: "Photosynthesis occurs in Chloroplasts.", answer: "True" },
        { type: "fill", question: "Plant cell walls are primarily composed of __________.", answer: "Cellulose" }
      ]
    });

    setIsCreateOpen(false);
    setFormTitle("");
    setFormDesc("");
    setFormDueDate("");
    setFormTimeLimit("15");
  };

  const handleDeleteQuiz = async (id: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      await deleteQuizMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Activity className="w-32 h-32 text-indigo-300 transform rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold font-heading tracking-tight text-white drop-shadow-md">
              Assessments <span className="text-indigo-400">&</span> Quizzes
            </h1>
            <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
              Test your subject proficiency, view time limits, and review your grading analytics.
            </p>
          </div>

        {isEdu && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger
              render={
                <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs rounded-xl h-9">
                  <Plus className="h-4 w-4" /> Create Quiz
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Course Quiz</DialogTitle>
                <DialogDescription>Define a new quiz and add default questions.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateQuiz} className="space-y-4 pt-3 text-xs">
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
                  <label className="font-semibold">Quiz Title</label>
                  <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Science Quiz: Biology Basics" className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Quiz Instructions</label>
                  <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Explain instructions or rules." className="text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold">Time Limit (mins)</label>
                    <Input type="number" value={formTimeLimit} onChange={e => setFormTimeLimit(e.target.value)} className="text-xs h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold">Due Date</label>
                    <Input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className="text-xs h-9" />
                  </div>
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
          <Input placeholder="Search quizzes..." className="pl-9 text-xs h-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
      {quizzesLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 w-full bg-muted/40 animate-pulse rounded-2xl border border-border/50" />
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card className="border-dashed p-16 text-center max-w-lg mx-auto bg-card/50 backdrop-blur-sm rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8" />
          </div>
          <p className="font-bold text-lg text-foreground">No quizzes assigned</p>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Excellent! You have successfully completed all your course quizzes.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz, idx) => {
            const classObj = classes.find(c => c.id === quiz.class_id);
            return (
              <motion.div 
                key={quiz.id} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Card className="group border-border/50 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 bg-card rounded-2xl overflow-hidden h-full flex flex-col relative">
                  {/* Decorative accent bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <Badge className="bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 border-none text-[10px] font-bold transition-colors">
                        {classObj ? classObj.name : "Module Track"}
                      </Badge>
                    </div>

                    <h3 className="font-extrabold text-sm text-foreground line-clamp-1 mb-1">{quiz.title}</h3>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-5 flex-1">
                      {quiz.description || "Take this assessment to complete the current module milestone."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold bg-muted/40 p-2 rounded-lg">
                        <Clock className="h-3 w-3 text-indigo-500" /> 
                        <span>{quiz.time_limit || 15} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold bg-muted/40 p-2 rounded-lg">
                        <HelpCircle className="h-3 w-3 text-indigo-500" /> 
                        <span>{quiz.questions?.length || 3} Qs</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        {quiz.due_date ? (
                          <Badge variant="outline" className="bg-red-500/5 text-red-600 border-red-200/50 text-[10px] font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg">
                            <Calendar className="h-3 w-3" /> Due {format(new Date(quiz.due_date), "MMM d")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] font-bold py-1 px-2.5 rounded-lg">
                            No deadline
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {isEdu && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500" onClick={() => handleDeleteQuiz(quiz.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href={`/quizzes/${quiz.id}`}>
                          <Button size="icon" className="h-8 w-8 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white rounded-xl shadow-sm group-hover:shadow-md transition-all group-hover:bg-indigo-600 group-hover:text-white">
                            <PlayCircle className="h-4 w-4" />
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
