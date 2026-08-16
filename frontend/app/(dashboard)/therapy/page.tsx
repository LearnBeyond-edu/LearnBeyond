"use client";

import { useState, useEffect } from "react";
import { PageHeader, EmptyState } from "@/components/common/AdminUI";
import { TeletherapyRoom } from "@/components/teletherapy/TeletherapyRoom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartPulse, Video, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";

export default function StudentTherapyPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const loadSessions = () => {
      const refs = JSON.parse(localStorage.getItem("therapist-referrals") || "[]");
      const mapped = refs
        .filter((r: any) => {
          const matchesId = r.userId === user?.id || r.studentId === user?.id;
          const matchesName = user?.firstName && r.studentName?.toLowerCase().includes(user.firstName.toLowerCase());
          return (matchesId || matchesName) && r.status !== "pending";
        })
        .map((r: any) => ({
          id: r.id,
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
  }, [user?.id, user?.firstName]);

  const filtered = sessions.filter(s => s.status === activeTab);

  return (
    <div className="max-w-6xl space-y-6">
      {activeSession ? (
        <>
          <PageHeader
            title="Teletherapy Room"
            subtitle={`Live clinical session`}
            actions={<Button variant="outline" onClick={() => setActiveSession(null)}><ArrowLeft className="h-4 w-4 mr-2" /> Leave Session</Button>}
          />
          <TeletherapyRoom recipientName="Dr. Therapist" role="student" />
        </>
      ) : (
        <>
          <PageHeader
            title="Therapy Sessions"
            subtitle="View your upcoming clinical appointments and past completed sessions."
          />

          <div className="flex gap-2 border-b pb-4 overflow-x-auto">
            <Button variant={activeTab === "upcoming" ? "default" : "ghost"} onClick={() => setActiveTab("upcoming")} className={activeTab === "upcoming" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}>Upcoming ({sessions.filter(s => s.status === "upcoming").length})</Button>
            <Button variant={activeTab === "completed" ? "default" : "ghost"} onClick={() => setActiveTab("completed")} className={activeTab === "completed" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}>Completed</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {filtered.length === 0 ? (
                <Card className="border-border/60">
                  <CardContent className="p-8">
                    <EmptyState icon={<HeartPulse className="h-10 w-10 text-muted-foreground" />} title="No sessions found" description={`You have no ${activeTab} therapy sessions.`} />
                  </CardContent>
                </Card>
              ) : (
                filtered.map((session, idx) => (
                  <Card key={idx} className="border-border/60 hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex flex-col sm:flex-row gap-5">
                      <div className="p-4 rounded-xl bg-rose-500/10 text-center min-w-[90px] flex flex-col justify-center">
                        <p className="text-xs font-bold text-rose-600 uppercase">{format(new Date(session.date), "MMM d")}</p>
                        <p className="text-lg font-bold text-rose-700 mt-0.5">{session.time}</p>
                        <p className="text-[10px] text-rose-600/70 font-semibold mt-1">{session.duration}</p>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-base flex items-center gap-2">
                              {session.type}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Scheduled Appointment</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center pt-2 border-t border-border/50">
                          {session.status === "upcoming" && (
                            <Button size="sm" className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setActiveSession(session)}>
                              <Video className="h-3.5 w-3.5" /> Attend Therapy
                            </Button>
                          )}
                          {session.status === "completed" && (
                            <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-xs pointer-events-none">
                              Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <div className="md:col-span-1">
              <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                    <HeartPulse className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Clinical Support</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Teletherapy sessions are securely encrypted. Please join the room 5 minutes before your scheduled time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
