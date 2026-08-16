"use client";

import { useState, useEffect } from "react";
import { PageHeader, EmptyState } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartPulse, Plus, Search, Calendar, User, Clock, FileText, Paperclip, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TeletherapyRoom } from "@/components/teletherapy/TeletherapyRoom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudents } from "@/hooks/useSchool";
import { flattenInfinitePages, getDisplayName } from "@/lib/therapist";
import { Trash2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TherapistSessionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [activeSession, setActiveSession] = useState<any | null>(null);

  const [sessions, setSessions] = useState<any[]>([]);
  
  const { data: studentsData } = useStudents(100);
  const students = flattenInfinitePages(studentsData);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [formStudent, setFormStudent] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");

  useEffect(() => {
    const loadSessions = () => {
      const refs = JSON.parse(localStorage.getItem("therapist-referrals") || "[]");
      const mapped = refs
        .filter((r: any) => r.status !== "pending")
        .map((r: any) => ({
          id: r.id,
          student: r.studentName,
          type: "Clinical Support Referral",
          date: r.date || new Date().toISOString().split("T")[0],
          time: r.time,
          duration: "45 min",
          status: r.status === "scheduled" ? "upcoming" : r.status
        }));
      setSessions(mapped);
    };
    
    loadSessions();
    window.addEventListener("storage", loadSessions);
    return () => window.removeEventListener("storage", loadSessions);
  }, []);

  const filtered = sessions.filter(s => s.status === activeTab);

  const handleScheduleSessionSubmit = () => {
    if (!formStudent || !formDate || !formTime) {
      return toast.error("Please fill out all fields");
    }
    const refs = JSON.parse(localStorage.getItem("therapist-referrals") || "[]");
    refs.push({
      id: "session-" + Date.now(),
      studentName: formStudent,
      status: "scheduled",
      date: formDate,
      time: formTime
    });
    localStorage.setItem("therapist-referrals", JSON.stringify(refs));
    window.dispatchEvent(new Event("storage"));
    toast.success("New session scheduled successfully");
    setIsScheduleOpen(false);
    setFormStudent(""); setFormDate(""); setFormTime("");
  };

  const handleDeleteSession = (id: string) => {
    const refs = JSON.parse(localStorage.getItem("therapist-referrals") || "[]");
    const updated = refs.filter((r: any) => r.id !== id);
    localStorage.setItem("therapist-referrals", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    toast.success("Session cancelled and deleted");
  };

  const handleCompleteSession = (id: string) => {
    const refs = JSON.parse(localStorage.getItem("therapist-referrals") || "[]");
    const updated = refs.map((r: any) => r.id === id ? { ...r, status: "completed" } : r);
    localStorage.setItem("therapist-referrals", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    toast.success("Session completed and saved!");
    setActiveSession(null);
  };

  return (
    <div className="max-w-6xl space-y-6">
      {activeSession ? (
        <>
          <PageHeader
            title="Teletherapy Room"
            subtitle={`Live clinical session with ${activeSession.student}`}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveSession(null)}>Back to Schedule</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => handleCompleteSession(activeSession.id)}><CheckCircle className="h-4 w-4" /> Complete Therapy</Button>
              </div>
            }
          />
          <TeletherapyRoom recipientName={activeSession.student} role="therapist" />
        </>
      ) : (
        <>
          <PageHeader
            title="Therapy Sessions"
            subtitle="Manage your schedule, conduct sessions, and review clinical history"
            actions={<Button onClick={() => setIsScheduleOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus className="h-4 w-4" /> Schedule Session</Button>}
          />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b pb-4">
        <div className="flex gap-2 w-full overflow-x-auto">
          <Button variant={activeTab === "upcoming" ? "default" : "ghost"} onClick={() => setActiveTab("upcoming")} className={activeTab === "upcoming" ? "bg-teal-600 hover:bg-teal-700" : ""}>Upcoming ({sessions.filter(s => s.status === "upcoming").length})</Button>
          <Button variant={activeTab === "completed" ? "default" : "ghost"} onClick={() => setActiveTab("completed")} className={activeTab === "completed" ? "bg-teal-600 hover:bg-teal-700" : ""}>Completed</Button>
          <Button variant={activeTab === "cancelled" ? "default" : "ghost"} onClick={() => setActiveTab("cancelled")} className={activeTab === "cancelled" ? "bg-teal-600 hover:bg-teal-700" : ""}>Cancelled</Button>
        </div>
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search sessions..." />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {filtered.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="p-8">
                <EmptyState icon={<HeartPulse className="h-10 w-10" />} title="No sessions found" description={`You have no ${activeTab} sessions.`} />
              </CardContent>
            </Card>
          ) : (
            filtered.map((session, idx) => (
              <Card key={idx} className="border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col sm:flex-row gap-5">
                  <div className="p-4 rounded-xl bg-teal-500/10 text-center min-w-[90px] flex flex-col justify-center">
                    <p className="text-xs font-bold text-teal-600 uppercase">{format(new Date(session.date), "MMM d")}</p>
                    <p className="text-lg font-bold text-teal-700 mt-0.5">{session.time}</p>
                    <p className="text-[10px] text-teal-600/70 font-semibold mt-1">{session.duration}</p>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {session.student}</h3>
                        <p className="text-sm text-muted-foreground">{session.type}</p>
                      </div>
                      <Badge variant="outline" className={`
                        ${session.status === 'upcoming' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : ''}
                        ${session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : ''}
                        ${session.status === 'cancelled' ? 'bg-red-500/10 text-red-600 border-red-200' : ''}
                      `}>
                        {session.status}
                      </Badge>
                    </div>
                    
                    {activeTab === "upcoming" ? (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs gap-1.5" onClick={() => setActiveSession(session)}><Video className="h-3.5 w-3.5" /> Start Teletherapy</Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => router.push("/therapist/notes")}><FileText className="h-3.5 w-3.5" /> Prep Notes</Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2" onClick={() => handleDeleteSession(session.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ) : activeTab === "completed" ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => router.push("/therapist/notes")}><FileText className="h-3.5 w-3.5" /> View Session Notes</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5 text-muted-foreground"><Paperclip className="h-3.5 w-3.5" /> Attachments</Button>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/60 bg-gradient-to-b from-teal-500/5 to-transparent">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold">Session Objectives</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Common Activities</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="font-normal text-xs bg-background">Sensory Diet</Badge>
                  <Badge variant="secondary" className="font-normal text-xs bg-background">Social Story</Badge>
                  <Badge variant="secondary" className="font-normal text-xs bg-background">Fine Motor Play</Badge>
                  <Badge variant="secondary" className="font-normal text-xs bg-background">Visual Schedule</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </>
      )}

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Therapy Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={formStudent} onValueChange={setFormStudent}>
                <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => (
                    <SelectItem key={s.id} value={getDisplayName(s)}>{getDisplayName(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleScheduleSessionSubmit}>Confirm Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
