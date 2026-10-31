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
    const myClasses = allClasses.filter(c => c.teacher_id === user?.id || c.teacher_id === myProfile?.id);
    const myClassIds = myClasses.map(c => c.id);
    const myStudents = allStudents.filter(s => myClassIds.includes(s.class_id));

    // Fetch unified messages from backend API + shared store
    const allDirectMessages = await messageService.getMessages();

    // Migrate any legacy messages if present
    const legacySaved = localStorage.getItem(`teacher-messages-${user?.id}`);
    if (legacySaved) {
      try {
        const parsed = JSON.parse(legacySaved);
        parsed.forEach((t: any) => {
          if (Array.isArray(t.messages)) {
            t.messages.forEach((m: any) => {
              messageService.sendMessage({
                sender_id: user?.id || "teacher",
                sender_name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Teacher",
                recipient_id: t.parentUserId || t.id,
                recipient_name: t.name,
                student_name: t.studentName,
                text: m.text,
              }).catch(() => {});
            });
          }
        });
        localStorage.removeItem(`teacher-messages-${user?.id}`);
      } catch (e) {}
    }

    const candidateParents: { parentUserId: string; name: string; studentName: string }[] = [];

    // 1. Assigned class parents
    myStudents.forEach(student => {
      const p = allParents.find(parent => parent.student_id === student.id || parent.student_id === student.user_id);
      if (p) {
        candidateParents.push({
          parentUserId: p.user_id || p.id,
          name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "Parent",
          studentName: [student.first_name, student.last_name].filter(Boolean).join(" ") || "Student",
        });
      }
    });

    // 2. All school parents
    allParents.forEach(p => {
      const student = allStudents.find(s => s.id === p.student_id || s.user_id === p.student_id);
      candidateParents.push({
        parentUserId: p.user_id || p.id,
        name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "Parent",
        studentName: student ? [student.first_name, student.last_name].filter(Boolean).join(" ") : "Student",
      });
    });

    // 3. Parents from incoming messages
    allDirectMessages.forEach(m => {
      const otherId = m.sender_id === user?.id ? m.recipient_id : m.sender_id;
      const otherName = m.sender_id === user?.id ? m.recipient_name : m.sender_name;
      if (otherId && otherId !== user?.id) {
        candidateParents.push({
          parentUserId: otherId,
          name: otherName || "Parent",
          studentName: m.student_name || "Student",
        });
      }
    });

    // 4. Default mock parent fallback if list is empty
    if (candidateParents.length === 0) {
      candidateParents.push({
        parentUserId: "parent@learnbeyond.edu",
        name: "Martha Appleseed (Parent)",
        studentName: "Johnny Appleseed",
      });
    }

    // Deduplicate candidate parents
    const uniqueMap = new Map<string, { parentUserId: string; name: string; studentName: string }>();
    candidateParents.forEach(cp => {
      const key = `${cp.name.trim().toLowerCase()}_${cp.studentName.trim().toLowerCase()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, cp);
      }
    });

    // Build chat threads with actual synced messages
    const builtThreads: ChatThread[] = [];
    uniqueMap.forEach(({ parentUserId, name, studentName }) => {
      const threadMessages: { sender: "me" | "them"; text: string; time: Date }[] = [];

      allDirectMessages.forEach(m => {
        const isFromMeToParent = m.sender_id === user?.id && (m.recipient_id === parentUserId || m.recipient_name?.toLowerCase() === name.toLowerCase());
        const isFromParentToMe = (m.sender_id === parentUserId || m.sender_name?.toLowerCase() === name.toLowerCase()) && (m.recipient_id === user?.id || !m.recipient_id);
        const isMatchingStudent = m.student_name && studentName && m.student_name.toLowerCase() === studentName.toLowerCase();

        if (isFromMeToParent || isFromParentToMe || isMatchingStudent) {
          const isSenderMe = m.sender_id === user?.id;
          threadMessages.push({
            sender: isSenderMe ? "me" : "them",
            text: m.text,
            time: new Date(m.created_at),
          });
        }
      });

      threadMessages.sort((a, b) => a.time.getTime() - b.time.getTime());

      const lastMsg = threadMessages.length > 0 ? threadMessages[threadMessages.length - 1].text : "No messages yet.";
      const lastTime = threadMessages.length > 0 ? threadMessages[threadMessages.length - 1].time : new Date();

      builtThreads.push({
        id: `thread_parent_${parentUserId}`,
        name,
        studentName,
        role: "Parent",
        lastMessage: lastMsg,
        timestamp: lastTime,
        unread: false,
        parentUserId,
        messages: threadMessages,
      });
    });

    builtThreads.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setThreads(builtThreads);
    if (!activeThreadId && builtThreads.length > 0) {
      setActiveThreadId(builtThreads[0].id);
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

    // 3-second live sync polling interval for real-time across cloud & multiple devices
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
    if (!inputText.trim() || !activeThread) return;
    const textToSend = inputText.trim();
    setInputText("");
    setSuggestedReply(null);

    const newMessage = {
      sender: "me" as const,
      text: textToSend,
      time: new Date(),
    };

    // Instant optimistic update
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              lastMessage: textToSend,
              timestamp: new Date(),
              messages: [...t.messages, newMessage],
            }
          : t
      )
    );

    // Send through persistent messageService (updates DB on Render + broadcasts)
    await messageService.sendMessage({
      sender_id: user?.id || "teacher_user",
      sender_name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Jane Smith (Teacher)",
      recipient_id: activeThread.parentUserId || activeThread.id,
      recipient_name: activeThread.name,
      student_name: activeThread.studentName,
      text: textToSend,
      channel: "teacher_parent",
    });

    // Re-sync immediately
    syncAllThreads();
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
