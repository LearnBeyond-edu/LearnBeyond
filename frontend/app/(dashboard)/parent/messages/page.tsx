"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, User, Sparkles, BrainCircuit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents, useTeachers, useClasses, useParents } from "@/hooks/useSchool";
import { messageService, DirectMessage } from "@/services/messageService";

interface ChatThread {
  id: string;
  name: string;
  studentName?: string;
  role: "Teacher";
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  teacherUserId?: string;
  messages: { sender: "me" | "them"; text: string; time: Date }[];
}

export default function ParentMessagesPage() {
  const { user } = useAuthStore();
  const { data: studentsData } = useStudents(100);
  const { data: classesData } = useClasses(100);
  const { data: teachersData } = useTeachers(100);
  const { data: parentsData } = useParents(100);

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
    const allTeachers = teachersData?.pages.flatMap((p) => p.data) ?? [];
    const allParents = parentsData?.pages.flatMap((p) => p.data) ?? [];

    const myChildrenIds = allParents.filter(p => p.user_id === user?.id).map(p => p.student_id);
    const myChildren = allStudents.filter(s => myChildrenIds.includes(s.id) || myChildrenIds.includes(s.user_id));

    // Fetch unified messages from backend API + shared store
    const allDirectMessages = await messageService.getMessages();

    // Migrate any legacy messages if present
    const legacySaved = localStorage.getItem(`parent-messages-${user?.id}`);
    if (legacySaved) {
      try {
        const parsed = JSON.parse(legacySaved);
        parsed.forEach((t: any) => {
          if (Array.isArray(t.messages)) {
            t.messages.forEach((m: any) => {
              messageService.sendMessage({
                sender_id: user?.id || "parent",
                sender_name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Parent",
                recipient_id: t.teacherUserId || t.id,
                recipient_name: t.name,
                student_name: t.studentName,
                text: m.text,
              }).catch(() => {});
            });
          }
        });
        localStorage.removeItem(`parent-messages-${user?.id}`);
      } catch (e) {}
    }

    const candidateTeachers: { teacherUserId: string; name: string; studentName: string }[] = [];

    // 1. Teachers of children's classes
    myChildren.forEach(child => {
      const childClass = allClasses.find(c => c.id === child.class_id);
      if (childClass) {
        const teacher = allTeachers.find(t => t.user_id === childClass.teacher_id || t.id === childClass.teacher_id);
        if (teacher) {
          candidateTeachers.push({
            teacherUserId: teacher.user_id || teacher.id,
            name: [teacher.first_name, teacher.last_name].filter(Boolean).join(" ") || "Jane Smith (Teacher)",
            studentName: [child.first_name, child.last_name].filter(Boolean).join(" ") || "Johnny Appleseed",
          });
        }
      }
    });

    // 2. All school teachers
    allTeachers.forEach(teacher => {
      const child = myChildren[0];
      candidateTeachers.push({
        teacherUserId: teacher.user_id || teacher.id,
        name: [teacher.first_name, teacher.last_name].filter(Boolean).join(" ") || "Jane Smith (Teacher)",
        studentName: child ? [child.first_name, child.last_name].filter(Boolean).join(" ") : "Johnny Appleseed",
      });
    });

    // 3. Teachers from incoming messages
    allDirectMessages.forEach(m => {
      const otherId = m.sender_id === user?.id ? m.recipient_id : m.sender_id;
      const otherName = m.sender_id === user?.id ? m.recipient_name : m.sender_name;
      if (otherId && otherId !== user?.id) {
        candidateTeachers.push({
          teacherUserId: otherId,
          name: otherName || "Teacher",
          studentName: m.student_name || "Johnny Appleseed",
        });
      }
    });

    // 4. Default mock teacher fallback if list is empty
    if (candidateTeachers.length === 0) {
      candidateTeachers.push({
        teacherUserId: "teacher@learnbeyond.edu",
        name: "Jane Smith (Teacher)",
        studentName: "Johnny Appleseed",
      });
    }

    // Deduplicate candidate teachers
    const uniqueMap = new Map<string, { teacherUserId: string; name: string; studentName: string }>();
    candidateTeachers.forEach(ct => {
      const key = `${ct.name.trim().toLowerCase()}_${ct.studentName.trim().toLowerCase()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, ct);
      }
    });

    // Build chat threads with actual synced messages
    const builtThreads: ChatThread[] = [];
    uniqueMap.forEach(({ teacherUserId, name, studentName }) => {
      const threadMessages: { sender: "me" | "them"; text: string; time: Date }[] = [];

      allDirectMessages.forEach(m => {
        const isFromMeToTeacher = m.sender_id === user?.id && (m.recipient_id === teacherUserId || m.recipient_name?.toLowerCase() === name.toLowerCase());
        const isFromTeacherToMe = (m.sender_id === teacherUserId || m.sender_name?.toLowerCase() === name.toLowerCase()) && (m.recipient_id === user?.id || !m.recipient_id);
        const isMatchingStudent = m.student_name && studentName && m.student_name.toLowerCase() === studentName.toLowerCase();

        if (isFromMeToTeacher || isFromTeacherToMe || isMatchingStudent) {
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
        id: `thread_teacher_${teacherUserId}`,
        name,
        studentName,
        role: "Teacher",
        lastMessage: lastMsg,
        timestamp: lastTime,
        unread: false,
        teacherUserId,
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
  }, [studentsData, classesData, teachersData, parentsData, user]);

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
      sender_id: user?.id || "parent_user",
      sender_name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Martha Appleseed (Parent)",
      recipient_id: activeThread.teacherUserId || activeThread.id,
      recipient_name: activeThread.name,
      student_name: activeThread.studentName,
      text: textToSend,
      channel: "teacher_parent",
    });

    // Re-sync immediately
    syncAllThreads();
  };

  const generateAISuggestedReply = () => {
    setSuggestedReply(`Thank you for the update regarding ${activeThread?.studentName?.split(" ")[0] || "my child"}. I appreciate the support!`);
  };

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px] flex rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <div className="w-80 border-r flex flex-col shrink-0">
        <div className="p-4 border-b space-y-3">
          <h2 className="font-bold text-lg">Conversations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/40">
          {filteredThreads.map((thread) => {
            const isSelected = activeThreadId === thread.id;
            const initials = thread.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <button
                key={thread.id}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  setThreads((prev) =>
                    prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t))
                  );
                  setSuggestedReply(null);
                }}
                className={`w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors ${
                  isSelected ? "bg-primary/5" : ""
                }`}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold truncate">{thread.name}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {format(thread.timestamp, "h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {thread.lastMessage}
                    </p>
                    {thread.unread && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-semibold bg-muted px-1.5 py-0.5 rounded inline-block">
                      {thread.role}
                    </span>
                    {thread.studentName && (
                      <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                        Student: {thread.studentName}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-muted/5">
        {activeThread ? (
          <>
            <div className="p-4 border-b bg-card flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{activeThread.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {activeThread.role}
                  {activeThread.studentName && (
                    <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block text-[10px]">
                      Student: {activeThread.studentName}
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-500 hover:text-blue-600 gap-1.5"
                onClick={generateAISuggestedReply}
              >
                <BrainCircuit className="h-4 w-4" /> AI Suggest Reply
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeThread.messages.map((msg, index) => {
                const isMe = msg.sender === "me";
                return (
                  <div
                    key={index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3.5 rounded-2xl text-sm shadow-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-card border rounded-tl-none"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <p
                        className={`text-[9px] mt-1.5 ${
                          isMe ? "text-primary-foreground/75" : "text-muted-foreground"
                        }`}
                      >
                        {format(msg.time, "h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-card space-y-3">
              {suggestedReply && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-semibold text-blue-600 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> AI Suggested Reply
                    </p>
                    <p className="text-xs text-muted-foreground italic">"{suggestedReply}"</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => setSuggestedReply(null)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white border-none"
                      onClick={() => {
                        setInputText(suggestedReply);
                        setSuggestedReply(null);
                      }}
                    >
                      Use Reply
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
            <User className="h-10 w-10 text-muted-foreground" />
            <p className="font-semibold text-sm">Select a Conversation</p>
            <p className="text-xs text-muted-foreground">
              Choose a message thread from the left sidebar to start talking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
