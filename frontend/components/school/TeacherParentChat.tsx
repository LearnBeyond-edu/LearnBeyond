"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, User, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents, useParents, useClasses, useTeachers } from "@/hooks/useSchool";
import { messageService, DirectMessage } from "@/services/messageService";

interface ChatThread {
  id: string;
  name: string;
  studentName?: string;
  role: "Parent";
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  parentUserId?: string;
  messages: { sender: "me" | "them"; text: string; time: Date }[];
}

export function TeacherParentChat() {
  const { user } = useAuthStore();
  const { data: studentsData } = useStudents(100);
  const { data: classesData } = useClasses(100);
  const { data: parentsData } = useParents(100);
  const { data: teachersData } = useTeachers(100);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [inputText, setInputText] = useState("");
  const [suggestedReply, setSuggestedReply] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThreadId, threads]);

  const syncAllThreads = async () => {
    const allStudents = studentsData?.pages.flatMap((p) => p.data) ?? [];
    const allClasses = classesData?.pages.flatMap((p) => p.data) ?? [];
    const allParents = parentsData?.pages.flatMap((p) => p.data) ?? [];
    const allTeachers = teachersData?.pages.flatMap((p) => p.data) ?? [];

    const myProfile = allTeachers.find(t => t.user_id === user?.id || t.id === user?.id);
    const myTeacherIds = [user?.id, myProfile?.id, myProfile?.user_id].filter(Boolean);

    // Filter classes assigned to this staff member
    const myClasses = allClasses.filter(c => 
      (c.class_teacher_id && myTeacherIds.includes(c.class_teacher_id)) || 
      (Boolean((c as any).teacher_id) && myTeacherIds.includes((c as any).teacher_id))
    );
    const myClassIds = myClasses.map(c => c.id);
    const currentInstId = user?.institutionId || (user as any)?.institution_id || myProfile?.institution_id;

    // Filter students belonging to this teacher's classes or institution
    const myStudents = allStudents.filter(s => {
      if (myClassIds.length > 0 && s.class_id && myClassIds.includes(s.class_id)) return true;
      if (currentInstId && s.institution_id) return s.institution_id === currentInstId;
      return false;
    });

    const myStudentIds = myStudents.flatMap(s => [s.id, s.user_id]).filter(Boolean);

    // Fetch unified messages from backend API + shared store
    const allDirectMessages = await messageService.getMessages();

    // Clean up legacy key
    if (typeof window !== "undefined" && user?.id) {
      localStorage.removeItem(`teacher-messages-${user.id}`);
    }

    // ONLY respective parents: must have student in this teacher's class/school, must match institution, and cannot be the teacher themselves
    const respectiveParents = allParents.filter(p => {
      if (p.user_id === user?.id || p.id === user?.id) return false;
      if (currentInstId && (p as any).institution_id && (p as any).institution_id !== currentInstId) return false;
      if (p.student_id && myStudentIds.length > 0 && !myStudentIds.includes(p.student_id)) return false;
      return true;
    });

    const candidateParents: { parentUserId: string; parentProfileId?: string; name: string; studentName: string }[] = [];

    respectiveParents.forEach(p => {
      const student = myStudents.find(s => s.id === p.student_id || s.user_id === p.student_id);
      const studentName = student ? [student.first_name, student.last_name].filter(Boolean).join(" ") : "Student";
      const parentName = [p.first_name, p.last_name].filter(Boolean).join(" ") || (p as any).name || (p as any).email || "Parent";
      candidateParents.push({
        parentUserId: p.user_id || p.id,
        parentProfileId: p.id,
        name: parentName,
        studentName,
      });
    });

    // Deduplicate candidate parents by parentUserId
    const uniqueMap = new Map<string, { parentUserId: string; parentProfileId?: string; name: string; studentName: string }>();
    candidateParents.forEach(cp => {
      if (cp.parentUserId && !uniqueMap.has(cp.parentUserId)) {
        uniqueMap.set(cp.parentUserId, cp);
      }
    });

    // Build chat threads with strictly filtered & deduplicated messages
    const builtThreads: ChatThread[] = [];
    uniqueMap.forEach(({ parentUserId, parentProfileId, name, studentName }) => {
      const threadMessages: { sender: "me" | "them"; text: string; time: Date }[] = [];

      allDirectMessages.forEach(m => {
        if (m.channel === "staff_therapist") return;

        const isFromMeToParent =
          (m.sender_id === user?.id || (myProfile?.id && m.sender_id === myProfile.id)) &&
          (m.recipient_id === parentUserId || (parentProfileId && m.recipient_id === parentProfileId));

        const isFromParentToMe =
          (m.sender_id === parentUserId || (parentProfileId && m.sender_id === parentProfileId)) &&
          (m.recipient_id === user?.id || (myProfile?.id && m.recipient_id === myProfile.id));

        if (isFromMeToParent || isFromParentToMe) {
          const isSenderMe = m.sender_id === user?.id || (myProfile?.id && m.sender_id === myProfile.id);
          threadMessages.push({
            sender: isSenderMe ? "me" : "them",
            text: m.text,
            time: new Date(m.created_at),
          });
        }
      });

      // Deduplicate identical messages sent within 3 seconds
      threadMessages.sort((a, b) => a.time.getTime() - b.time.getTime());
      const uniqueThreadMessages: { sender: "me" | "them"; text: string; time: Date }[] = [];
      for (const tm of threadMessages) {
        const isDup = uniqueThreadMessages.some(
          u => u.sender === tm.sender && u.text.trim().toLowerCase() === tm.text.trim().toLowerCase() && Math.abs(u.time.getTime() - tm.time.getTime()) < 3000
        );
        if (!isDup) {
          uniqueThreadMessages.push(tm);
        }
      }

      const lastMsg = uniqueThreadMessages.length > 0 ? uniqueThreadMessages[uniqueThreadMessages.length - 1].text : "No messages yet.";
      const lastTime = uniqueThreadMessages.length > 0 ? uniqueThreadMessages[uniqueThreadMessages.length - 1].time : new Date();

      builtThreads.push({
        id: `thread_parent_${parentUserId}`,
        name,
        studentName,
        role: "Parent",
        lastMessage: lastMsg,
        timestamp: lastTime,
        unread: false,
        parentUserId,
        messages: uniqueThreadMessages,
      });
    });

    builtThreads.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setThreads(builtThreads);
    if (builtThreads.length > 0) {
      setActiveThreadId((prev) => {
        const exists = builtThreads.some((t) => t.id === prev);
        return exists ? prev : builtThreads[0].id;
      });
    }
  };

  useEffect(() => {
    syncAllThreads();

    const handleSyncEvent = () => {
      syncAllThreads();
    };

    window.addEventListener("storage", handleSyncEvent);
    window.addEventListener("learnbeyond_chat_sync", handleSyncEvent);
    window.addEventListener("newMessageNotification", handleSyncEvent);

    const interval = setInterval(syncAllThreads, 3000);

    return () => {
      window.removeEventListener("storage", handleSyncEvent);
      window.removeEventListener("learnbeyond_chat_sync", handleSyncEvent);
      window.removeEventListener("newMessageNotification", handleSyncEvent);
      clearInterval(interval);
    };
  }, [studentsData, classesData, parentsData, teachersData, user]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const filteredThreads = threads.filter((t) => {
    const s = search.toLowerCase();
    return t.name.toLowerCase().includes(s) || (t.studentName && t.studentName.toLowerCase().includes(s));
  });

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeThread || isSending) return;
    const textToSend = inputText.trim();
    setInputText("");
    setSuggestedReply(null);
    setIsSending(true);

    try {
      await messageService.sendMessage({
        sender_id: user?.id || "teacher_user",
        sender_name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Teacher",
        recipient_id: activeThread.parentUserId || activeThread.id.replace('thread_parent_', ''),
        recipient_name: activeThread.name,
        student_name: activeThread.studentName,
        text: textToSend,
        channel: "teacher_parent",
      });

      await syncAllThreads();
    } finally {
      setIsSending(false);
    }
  };

  const generateAISuggestedReply = () => {
    setSuggestedReply(`Thank you for reaching out regarding ${activeThread?.studentName?.split(" ")[0] || "your child"}. We are seeing great progress in class!`);
  };

  return (
    <div className="flex h-[70vh] border rounded-xl overflow-hidden bg-background shadow-sm">
      <div className="w-80 border-r flex flex-col bg-muted/10 shrink-0">
        <div className="p-4 border-b bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-9 bg-muted/50 border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={`p-4 border-b cursor-pointer transition-colors ${
                activeThreadId === thread.id
                  ? "bg-primary/5 border-l-4 border-l-primary"
                  : "hover:bg-muted/50 border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-sm truncate pr-2">
                  {thread.name}
                </h4>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(thread.timestamp, "MMM d")}
                </span>
              </div>
              {thread.studentName && (
                <p className="text-[10px] text-muted-foreground font-medium mb-1 truncate">
                  Parent of: {thread.studentName}
                </p>
              )}
              <p className="text-xs text-muted-foreground truncate">
                {thread.lastMessage}
              </p>
            </div>
          ))}
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {activeThread ? (
          <>
            <div className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-background z-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/5 text-primary">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{activeThread.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Online
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeThread.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                      msg.sender === "me"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        msg.sender === "me"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {format(msg.time, "hh:mm a")}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-background border-t">
              {suggestedReply ? (
                <div className="mb-3 flex items-center gap-2 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-sm text-teal-800">
                  <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
                  <span className="flex-1 italic">"{suggestedReply}"</span>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 text-teal-700 hover:text-teal-800 hover:bg-teal-500/20" onClick={() => setSuggestedReply(null)}>Dismiss</Button>
                    <Button size="sm" className="h-7 bg-teal-600 hover:bg-teal-700" onClick={() => { setInputText(suggestedReply); setSuggestedReply(null); }}>Use</Button>
                  </div>
                </div>
              ) : (
                <div className="mb-3 flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 border-dashed bg-muted/30" onClick={generateAISuggestedReply}>
                    <Sparkles className="h-3 w-3 text-teal-600" /> AI Suggested Reply
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  className="flex-1 bg-muted/50 border-none focus-visible:ring-1 focus-visible:bg-background transition-colors"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  className="shrink-0 rounded-xl px-6"
                  disabled={!inputText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="h-8 w-8 opacity-50" />
            </div>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
