"use client";

import { useState, useEffect } from "react";
import { useStudents } from "@/hooks/useSchool";
import { flattenInfinitePages, getDisplayName } from "@/lib/therapist";
import { PageHeader, EmptyState } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search, Calendar, User, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TherapistNotesPage() {
  const { data: studentsData } = useStudents(100);
  const students = flattenInfinitePages(studentsData);
  
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("therapist-notes");
    if (saved) {
      setNotes(JSON.parse(saved));
    } else {
      setNotes([]);
    }
  }, []);

  const handleAddNote = () => {
    if (students.length === 0) {
      toast.error("You don't have any assigned students to write notes for.");
      return;
    }
    const student = students[Math.floor(Math.random() * students.length)];
    const newNote = {
      id: "note-" + Date.now(),
      studentName: getDisplayName(student),
      date: format(new Date(), "MMMM d, yyyy"),
      preview: "New clinical observation log. Student displayed positive engagement with the sensory activities today.",
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem("therapist-notes", JSON.stringify(updated));
    toast.success("New note created");
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem("therapist-notes", JSON.stringify(updated));
    toast.success("Note deleted");
  };

  const filteredNotes = notes.filter(n => n.studentName.toLowerCase().includes(search.toLowerCase()) || n.preview.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Progress Notes"
        subtitle="Document clinical observations and session outcomes"
        actions={<Button onClick={handleAddNote} className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus className="h-4 w-4" /> New Note</Button>}
      />

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search notes by student or keyword..." />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredNotes.length === 0 ? (
           <Card className="border-border/60"><CardContent className="p-8"><EmptyState icon={<FileText className="h-10 w-10" />} title="No notes found" description="Click New Note to start documenting." /></CardContent></Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-all border-border/60">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base flex items-center gap-1.5"><User className="h-4 w-4 text-muted-foreground" /> {note.studentName}</h3>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {note.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{note.preview}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">View Full</Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(note.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
