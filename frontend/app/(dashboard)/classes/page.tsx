"use client";

import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, Plus, Search, Filter, Trash2, Edit3, Eye, Copy, Archive, CheckCircle,
  Clock, Award, Layers, Users, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

export default function ClassesPage() {
  const { user } = useAuthStore();
  const role = user?.role || "Student";
  const isEdu = role === "Teacher" || role === "Platform Admin" || role === "Institution Admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");

  // Fetch real classes
  const { data: classesData, isLoading, refetch } = useClasses(50);
  const createClassMutation = useCreateClass();
  const updateClassMutation = useUpdateClass();
  const deleteClassMutation = useDeleteClass();

  const classes = useMemo(() => {
    return classesData?.pages?.flatMap(p => p.data) || [];
  }, [classesData]);

  // Filters logic
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const displayName = cls.name || `Class ${cls.grade || 'N/A'} - Section ${cls.section || 'N/A'}`;
      const matchSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (cls.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchSearch;
    });
  }, [classes, searchQuery]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    await createClassMutation.mutateAsync({
      institution_id: (user as any)?.institution_id || "inst-default",
      name: formName,
      description: formDesc,
      teacher_id: user?.id,
    });

    setIsCreateOpen(false);
    setFormName("");
    setFormDesc("");
  };

  const handleEditClick = (cls: any) => {
    setEditingClassId(cls.id);
    setFormName(cls.name);
    setFormDesc(cls.description || "");
    setIsEditOpen(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClassId || !formName.trim()) return;

    await updateClassMutation.mutateAsync({
      id: editingClassId,
      payload: {
        name: formName,
        description: formDesc,
      }
    });

    setIsEditOpen(false);
    setEditingClassId(null);
    setFormName("");
    setFormDesc("");
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm("Are you sure you want to delete this module? All lessons associated will be detached.")) {
      await deleteClassMutation.mutateAsync(id);
    }
  };

  const handleDuplicateClass = (cls: any) => {
    createClassMutation.mutate({
      institution_id: cls.institution_id,
      name: `${cls.name} (Copy)`,
      description: cls.description,
      teacher_id: cls.teacher_id,
    });
    toast.success("Module duplicated");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Learning Modules</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Browse and manage structured curriculum courses and learning tracks.
          </p>
        </div>

        {isEdu && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger
              render={
                <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs rounded-xl h-9">
                  <Plus className="h-4 w-4" /> Create Module
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Learning Module</DialogTitle>
                <DialogDescription>Define a new educational track or course.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClass} className="space-y-4 pt-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold">Module Title</label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Grade 4 Mathematics" className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Description</label>
                  <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Overview of learning outcomes, curriculum, and goals." className="text-xs" />
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search modules..." className="pl-9 text-xs h-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[140px] text-xs h-9"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-border/60 animate-pulse">
              <div className="h-40 bg-muted rounded-t-xl" />
              <CardContent className="space-y-3 p-4">
                <div className="h-4 w-2/3 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-8 w-1/3 bg-muted rounded mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card className="border-dashed p-12 text-center max-w-md mx-auto">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-sm">No modules found</p>
          <p className="text-xs text-muted-foreground mt-1">Try resetting search query filters or create a new module.</p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
            <motion.div key={cls.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="border-border/60 overflow-hidden flex flex-col h-full bg-card hover:shadow-md transition-shadow">
                {/* Mock Thumbnail overlay */}
                <div className="h-32 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 flex items-center justify-center border-b border-border/40 relative">
                  <div className="absolute top-3 left-3 flex gap-1">
                    <Badge className="bg-teal-500/10 text-teal-600 border-none font-bold text-[9px]">Mathematics</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px]">Grade 4</Badge>
                  </div>
                  <BookOpen className="h-12 w-12 text-teal-600/30" />
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm line-clamp-1">{cls.name || `Class ${cls.grade || 'N/A'} - Section ${cls.section || 'N/A'}`}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {cls.description || "Unlock essential learning modules and milestone assessments tailored for this subject track."}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/40 text-[10px] text-muted-foreground">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 8 Hours</span>
                      <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Intermediate</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 24 Students</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Link href={`/lessons?classId=${cls.id}`} className="flex-1 mr-2">
                        <Button className="w-full text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-1">
                          <Eye className="h-3.5 w-3.5" /> Enter Module
                        </Button>
                      </Link>

                      {isEdu && (
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => handleEditClick(cls)}>
                            <Edit3 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => handleDuplicateClass(cls)}>
                            <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl hover:bg-red-500/10" onClick={() => handleDeleteClass(cls.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Class Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Modify titles and curriculum outcomes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateClass} className="space-y-4 pt-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold">Module Title</label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Grade 4 Mathematics" className="text-xs" required />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold">Description</label>
              <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} className="text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
