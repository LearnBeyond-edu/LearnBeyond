"use client";

import { useState, useEffect } from "react";
import { PageHeader, EmptyState } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, CheckCircle, Clock, AlertTriangle, Target, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useStudents } from "@/hooks/useSchool";
import { flattenInfinitePages, getDisplayName } from "@/lib/therapist";

export default function TherapistRecommendationsPage() {
  const { data: studentsData } = useStudents(100);
  const students = flattenInfinitePages(studentsData);
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: "", student: "", target: "", priority: "", desc: "", category: "" });

  useEffect(() => {
    const saved = localStorage.getItem("therapist-recommendations");
    if (saved) setRecommendations(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    if (!form.title || !form.student || !form.desc || !form.priority) {
      return toast.error("Please fill all required fields");
    }
    const newRec = {
      id: "rec-" + Date.now(),
      ...form,
      status: "Active"
    };
    const updated = [newRec, ...recommendations];
    setRecommendations(updated);
    localStorage.setItem("therapist-recommendations", JSON.stringify(updated));
    toast.success("Recommendation added successfully");
    setIsOpen(false);
    setForm({ title: "", student: "", target: "", priority: "", desc: "", category: "" });
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Clinical Recommendations"
        subtitle="Manage actionable strategies for teachers, parents, and students"
        actions={<Button onClick={() => setIsOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus className="h-4 w-4" /> New Recommendation</Button>}
      />

      {recommendations.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-16">
            <EmptyState icon={<Sparkles className="h-10 w-10" />} title="No recommendations yet" description="Create actionable strategies for teachers, parents, and students." />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map(rec => (
            <Card key={rec.id} className="border-border/60 hover:shadow-md transition-all flex flex-col h-full">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[10px] bg-muted/50">{rec.category}</Badge>
                    <CardTitle className="text-base font-bold leading-tight">{rec.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] border-none ${
                    rec.priority === 'High' ? 'bg-red-500/10 text-red-600' :
                    rec.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {rec.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> For: <strong className="text-foreground">{rec.target}</strong></span>
                  <span className="text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {rec.student}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{rec.desc}</p>
                
                <div className="mt-5 pt-3 border-t flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${rec.status === 'Active' ? 'text-teal-600' : 'text-muted-foreground'}`}>
                    {rec.status === 'Active' ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />} {rec.status}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Recommendation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. Weighted blanket during reading" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={form.student} onValueChange={v => setForm({...form, student: v})}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s: any) => (
                      <SelectItem key={s.id} value={getDisplayName(s)}>{getDisplayName(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={form.target} onValueChange={v => setForm({...form, target: v})}>
                  <SelectTrigger><SelectValue placeholder="Who is this for?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue placeholder="e.g. Sensory" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sensory Diet">Sensory Diet</SelectItem>
                    <SelectItem value="Behavioral Support">Behavioral Support</SelectItem>
                    <SelectItem value="Academic Accommodation">Academic Accommodation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                  <SelectTrigger><SelectValue placeholder="Priority level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Explain the strategy..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSave}>Add Recommendation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
