"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Paperclip, Search, BrainCircuit, GraduationCap, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { useTherapists, useTeachers, useParents, useStudents } from "@/hooks/useSchool";
import { messageService } from "@/services/messageService";

interface ClinicalContact {
  id: string;
  userId: string;
  name: string;
  role: "Therapist" | "Teacher" | "Parent";
  subtext: string;
  studentName?: string;
  lastMessage: string;
  lastActive: Date;
  messages: { sender: string; isMe: boolean; text: string; time: string; timestamp: number }[];
}

export function StaffTherapistChat({ defaultRecipient }: { defaultRecipient?: string }) {
  const { user } = useAuthStore();
  const [inputText, setInputText] = useState("");
  const [activeContactId, setActiveContactId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTeacher = user?.role?.toLowerCase().includes("teacher") || user?.role?.toLowerCase().includes("staff");
  const isTherapist = user?.role?.toLowerCase().includes("therapist");

  const myName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || (user as any)?.name || (isTeacher ? "Teacher" : isTherapist ? "Therapist" : "Staff");

  const { data: therapistsData } = useTherapists(100);
  const { data: teachersData } = useTeachers(100);
  const { data: parentsData } = useParents(100);
  const { data: studentsData } = useStudents(100);

  const [threads, setThreads] = useState<ClinicalContact[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContactId, threads]);

  const syncChat = async () => {
    const allTherapists = therapistsData?.pages.flatMap((p) => p.data) ?? [];
    const allTeachers = teachersData?.pages.flatMap((p) => p.data) ?? [];
    const allParents = parentsData?.pages.flatMap((p) => p.data) ?? [];
    const allStudents = studentsData?.pages.flatMap((p) => p.data) ?? [];

    const allDirectMessages = await messageService.getMessages();

    const candidateContacts: {
      userId: string;
      name: string;
      role: "Therapist" | "Teacher" | "Parent";
      subtext: string;
      studentName?: string;
    }[] = [];

    const currentInstId = user?.institutionId || (user as any)?.institution_id;

    if (isTeacher) {
      // Teacher communicating with respective Clinical Therapists
      allTherapists.forEach((th) => {
        if (th.user_id === user?.id || th.id === user?.id) return;
        if (currentInstId && (th as any).institution_id && (th as any).institution_id !== currentInstId) return;
        const name = [th.first_name, th.last_name].filter(Boolean).join(" ") || (th as any).email || "Clinical Therapist";
        candidateContacts.push({
          userId: th.user_id || th.id,
          name,
          role: "Therapist",
          subtext: (th as any).specialization || "Clinical Therapy Team",
          studentName: "Clinical Case Discussion",
        });
      });
    } else if (isTherapist) {
      // Therapist communicating with respective Staff & respective Parents
      allTeachers.forEach((tc) => {
        if (tc.user_id === user?.id || tc.id === user?.id) return;
        if (currentInstId && (tc as any).institution_id && (tc as any).institution_id !== currentInstId) return;
        const name = [tc.first_name, tc.last_name].filter(Boolean).join(" ") || (tc as any).email || "School Staff";
        candidateContacts.push({
          userId: tc.user_id || tc.id,
          name,
          role: "Teacher",
          subtext: (tc as any).designation || "School Faculty / Staff",
          studentName: "Clinical Consultation",
        });
      });

      allParents.forEach((p) => {
        if (p.user_id === user?.id || p.id === user?.id) return;
        if (currentInstId && (p as any).institution_id && (p as any).institution_id !== currentInstId) return;
        const student = allStudents.find((s) => s.id === p.student_id || s.user_id === p.student_id);
        const studentName = student ? [student.first_name, student.last_name].filter(Boolean).join(" ") : undefined;
        const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || (p as any).email || "Parent";
        candidateContacts.push({
          userId: p.user_id || p.id,
          name,
          role: "Parent",
          subtext: studentName ? `Parent of: ${studentName}` : "Parent",
          studentName,
        });
      });
    } else {
      // General staff / admin or parent viewing clinical chat
      allTherapists.forEach((th) => {
        if (th.user_id === user?.id || th.id === user?.id) return;
        if (currentInstId && (th as any).institution_id && (th as any).institution_id !== currentInstId) return;
        const name = [th.first_name, th.last_name].filter(Boolean).join(" ") || "Clinical Therapist";
        candidateContacts.push({
          userId: th.user_id || th.id,
          name,
          role: "Therapist",
          subtext: (th as any).specialization || "Clinical Therapy Team",
        });
      });
    }

    // Deduplicate candidate contacts by userId
    const uniqueMap = new Map<string, typeof candidateContacts[0]>();
    candidateContacts.forEach((c) => {
      if (c.userId && !uniqueMap.has(c.userId) && c.userId !== user?.id) {
        uniqueMap.set(c.userId, c);
      }
    });

    const builtThreads: ClinicalContact[] = [];

    uniqueMap.forEach((contact) => {
      const messages: { sender: string; isMe: boolean; text: string; time: string; timestamp: number }[] = [];

      allDirectMessages.forEach((m) => {
        const isFromMeToOther = m.sender_id === user?.id && m.recipient_id === contact.userId;
        const isFromOtherToMe = m.sender_id === contact.userId && m.recipient_id === user?.id;

        if (isFromMeToOther || isFromOtherToMe) {
          const createdDate = new Date(m.created_at);
          messages.push({
            sender: isFromMeToOther ? myName : (m.sender_name || contact.name),
            isMe: isFromMeToOther,
            text: m.text,
            time: format(createdDate, "hh:mm a"),
            timestamp: createdDate.getTime(),
          });
        }
      });

      messages.sort((a, b) => a.timestamp - b.timestamp);

      // Deduplicate identical consecutive messages sent within 3 seconds
      const cleanMessages: typeof messages = [];
      for (const msg of messages) {
        const isDup = cleanMessages.some(
          (c) => c.isMe === msg.isMe && c.text.trim() === msg.text.trim() && Math.abs(c.timestamp - msg.timestamp) < 3000
        );
        if (!isDup) cleanMessages.push(msg);
      }

      const lastMsg = cleanMessages.length > 0 ? cleanMessages[cleanMessages.length - 1].text : "No messages yet.";
      const lastActive = cleanMessages.length > 0 ? new Date(cleanMessages[cleanMessages.length - 1].timestamp) : new Date();

      builtThreads.push({
        id: `clinical_${contact.userId}`,
        userId: contact.userId,
        name: contact.name,
        role: contact.role,
        subtext: contact.subtext,
        studentName: contact.studentName,
        lastMessage: lastMsg,
        lastActive,
        messages: cleanMessages,
      });
    });

    builtThreads.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());

    setThreads(builtThreads);
    if (builtThreads.length > 0) {
      setActiveContactId((prev) => {
        const exists = builtThreads.some((t) => t.id === prev);
        return exists ? prev : builtThreads[0].id;
      });
    }
  };

  useEffect(() => {
    syncChat();

    const handleSync = () => {
      syncChat();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("learnbeyond_chat_sync", handleSync);
    window.addEventListener("newMessageNotification", handleSync);

    const interval = setInterval(syncChat, 3000);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("learnbeyond_chat_sync", handleSync);
      window.removeEventListener("newMessageNotification", handleSync);
      clearInterval(interval);
    };
  }, [therapistsData, teachersData, parentsData, studentsData, user]);

  const activeThread = threads.find((t) => t.id === activeContactId) || threads[0];

  const filteredThreads = threads.filter((t) => {
    const s = search.toLowerCase();
    return t.name.toLowerCase().includes(s) || t.subtext.toLowerCase().includes(s) || t.lastMessage.toLowerCase().includes(s);
  });

  const handleSend = async () => {
    if (!inputText.trim() || !activeThread || isSending) return;
    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      await messageService.sendMessage({
        sender_id: user?.id || "user",
        sender_name: myName,
        recipient_id: activeThread.userId,
        recipient_name: activeThread.name,
        student_name: activeThread.studentName || "Clinical Consultation",
        text: textToSend,
        channel: "staff_therapist",
      });

      await syncChat();
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeThread) return;

    try {
      await messageService.sendMessage({
        sender_id: user?.id || "user",
        sender_name: myName,
        recipient_id: activeThread.userId,
        recipient_name: activeThread.name,
        student_name: activeThread.studentName || "Clinical Consultation",
        text: `📎 Attached File: ${file.name}`,
        channel: "staff_therapist",
      });

      await syncChat();
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";
  };

  return (
    <div className="flex h-[70vh] border rounded-xl overflow-hidden bg-background shadow-sm">
      {/* Sidebar Threads */}
      <div className="w-80 border-r flex flex-col bg-muted/10 shrink-0">
        <div className="p-4 border-b bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9 bg-muted/50 border-none"
              placeholder="Search clinical team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map((thread) => {
            const isSelected = activeContactId === thread.id;
            return (
              <div
                key={thread.id}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30 border-l-4 border-l-transparent"
                }`}
                onClick={() => setActiveContactId(thread.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-sm truncate pr-2">{thread.name}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{format(thread.lastActive, "MMM d")}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mb-1">
                  {thread.role === "Therapist" ? (
                    <BrainCircuit className="h-3 w-3 text-teal-600 shrink-0" />
                  ) : thread.role === "Teacher" ? (
                    <GraduationCap className="h-3 w-3 text-blue-600 shrink-0" />
                  ) : (
                    <User className="h-3 w-3 text-amber-600 shrink-0" />
                  )}
                  <span className="truncate">{thread.subtext}</span>
                </p>
                <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
              </div>
            );
          })}
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No clinical contacts found.
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {activeThread ? (
          <>
            <div className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-background z-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {getInitials(activeThread.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm">{activeThread.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span>{activeThread.subtext}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-[10px] text-emerald-600 font-medium">Online</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-3.5 w-3.5" /> Attach File
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeThread.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-sm">Clinical Discussion with {activeThread.name}</p>
                  <p className="text-xs max-w-sm">
                    Send a direct message below to start collaborating on student therapy and learning adaptations.
                  </p>
                </div>
              ) : (
                activeThread.messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] font-medium text-muted-foreground">{msg.sender}</span>
                      <span className="text-[9px] text-muted-foreground/60">{msg.time}</span>
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm max-w-[80%] ${
                        msg.isMe
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-background border-t">
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="text-muted-foreground flex-shrink-0 border-dashed bg-muted/30"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Type your clinical update for ${activeThread.name}...`}
                  className="flex-1 bg-muted/50 border-none focus-visible:ring-1 focus-visible:bg-background"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  className="shrink-0 rounded-xl px-6"
                  onClick={handleSend}
                  disabled={!inputText.trim() || isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <BrainCircuit className="h-10 w-10 opacity-40 mb-3" />
            <p className="font-semibold text-sm">Select a Clinical Consultation</p>
            <p className="text-xs">Choose a team member from the left to start communication.</p>
          </div>
        )}
      </div>
    </div>
  );
}
