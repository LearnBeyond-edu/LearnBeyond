"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, User, Sparkles, BrainCircuit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents, useTeachers, useClasses, useParents } from "@/hooks/useSchool";
import { notificationService } from "@/services/platformService";

interface ChatThread {
  id: string;
  name: string;
  studentName?: string;
  role: "Teacher";
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
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

  useEffect(() => {
    const allStudents = studentsData?.pages.flatMap((p) => p.data) ?? [];
    const allClasses = classesData?.pages.flatMap((p) => p.data) ?? [];
    const allTeachers = teachersData?.pages.flatMap((p) => p.data) ?? [];
    const allParents = parentsData?.pages.flatMap((p) => p.data) ?? [];
    const myParentProfile = allParents.find(p => p.user_id === user?.id);
    const myChildrenIds = allParents.filter(p => p.user_id === user?.id).map(p => p.student_id);
    const myChildren = allStudents.filter(s => myChildrenIds.includes(s.id) || myChildrenIds.includes(s.user_id));

    const savedThreads = localStorage.getItem(`parent-messages-${user?.id}`);
    let existingThreads: Record<string, ChatThread> = {};
    if (savedThreads) {
      try {
        const parsed = JSON.parse(savedThreads);
        parsed.forEach((t: any) => {
          existingThreads[t.id] = {
            ...t,
            timestamp: new Date(t.timestamp),
            messages: t.messages.map((m: any) => ({ ...m, time: new Date(m.time) }))
          };
        });
      } catch (e) {}
    }

    const generatedThreads: ChatThread[] = [];

    // Fallback: If no classes match, let's at least show threads we found in localStorage
    const teacherMessagesMap = new Map();
    if (typeof window !== "undefined") {
       for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('teacher-messages-')) {
             try {
                const tParsed = JSON.parse(localStorage.getItem(key) || "[]");
                tParsed.forEach((t: any) => {
                   if (t.id.includes(`parent_${myParentProfile?.id}`)) {
                      const teacherUserId = key.replace('teacher-messages-', '');
                      teacherMessagesMap.set(teacherUserId, t);
                   }
                });
             } catch(e) {}
          }
       }
    }

    myChildren.forEach(child => {
      const childClass = allClasses.find(c => c.id === child.class_id);
      if (childClass) {
        // Teacher might be mapped via user_id or staff_profile id
        const teacher = allTeachers.find(t => t.user_id === childClass.teacher_id || t.id === childClass.teacher_id);
        
        if (teacher) {
          const threadId = `teacher_${teacher.user_id}_child_${child.id}`;
          
          let threadToPush: ChatThread;
          
          if (existingThreads[threadId]) {
            threadToPush = existingThreads[threadId];
          } else {
            threadToPush = {
              id: threadId,
              name: [teacher.first_name, teacher.last_name].filter(Boolean).join(" ") || "Teacher",
              studentName: [child.first_name, child.last_name].filter(Boolean).join(" "),
              role: "Teacher",
              lastMessage: "No messages yet.",
              timestamp: new Date(),
              unread: false,
              messages: []
            };
          }

          // Merge teacher's local storage
          const threadFromTeacher = teacherMessagesMap.get(teacher.user_id);
          if (threadFromTeacher && threadFromTeacher.messages) {
             const newMessages = [...threadToPush.messages];
             threadFromTeacher.messages.forEach((m: any) => {
                const exists = newMessages.find(nm => new Date(nm.time).getTime() === new Date(m.time).getTime() && nm.text === m.text);
                if (!exists && m.sender === "me") {
                   newMessages.push({
                      sender: "them",
                      text: m.text,
                      time: new Date(m.time)
                   });
                }
             });
             newMessages.sort((a, b) => a.time.getTime() - b.time.getTime());
             if (newMessages.length > 0) {
                const lastMsg = newMessages[newMessages.length - 1];
                threadToPush.messages = newMessages;
                threadToPush.lastMessage = lastMsg.text;
                threadToPush.timestamp = lastMsg.time;
             }
             teacherMessagesMap.delete(teacher.user_id);
          }

          generatedThreads.push(threadToPush);
        }
      }
    });

    // If teacher didn't match any child class (e.g. they sent us a message anyway), push them too!
    teacherMessagesMap.forEach((threadFromTeacher, teacherUserId) => {
       const teacher = allTeachers.find(t => t.user_id === teacherUserId);
       const threadId = `teacher_${teacherUserId}_orphan`;
       
       let threadToPush: ChatThread;
       if (existingThreads[threadId]) {
          threadToPush = existingThreads[threadId];
       } else {
          threadToPush = {
              id: threadId,
              name: teacher ? [teacher.first_name, teacher.last_name].filter(Boolean).join(" ") || "Teacher" : "Unknown Teacher",
              studentName: threadFromTeacher.studentName || "Your Child",
              role: "Teacher",
              lastMessage: "No messages yet.",
              timestamp: new Date(),
              unread: false,
              messages: []
          };
       }

       const newMessages = [...threadToPush.messages];
       threadFromTeacher.messages.forEach((m: any) => {
          const exists = newMessages.find(nm => new Date(nm.time).getTime() === new Date(m.time).getTime() && nm.text === m.text);
          if (!exists && m.sender === "me") {
             newMessages.push({
                sender: "them",
                text: m.text,
                time: new Date(m.time)
             });
          }
       });
       newMessages.sort((a, b) => a.time.getTime() - b.time.getTime());
       if (newMessages.length > 0) {
          const lastMsg = newMessages[newMessages.length - 1];
          threadToPush.messages = newMessages;
          threadToPush.lastMessage = lastMsg.text;
          threadToPush.timestamp = lastMsg.time;
       }

       generatedThreads.push(threadToPush);
    });

    if (generatedThreads.length > 0) {
      setThreads(generatedThreads.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      if (!activeThreadId) setActiveThreadId(generatedThreads[0].id);
    } else {
      setThreads([]);
      setActiveThreadId("");
    }
  }, [studentsData, classesData, teachersData, parentsData, user]);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const filteredThreads = threads.filter((t) => {
    const s = search.toLowerCase();
    return t.name.toLowerCase().includes(s) || (t.studentName && t.studentName.toLowerCase().includes(s));
  });

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeThread) return;
    const newMessage = {
      sender: "me" as const,
      text: inputText,
      time: new Date(),
    };

    setThreads((prev) => {
      const newThreads = prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              lastMessage: inputText,
              timestamp: new Date(),
              messages: [...t.messages, newMessage],
            }
          : t
      );
      localStorage.setItem(`parent-messages-${user?.id}`, JSON.stringify(newThreads));
      return newThreads;
    });

    // Simulate notification locally for current user UI refresh
    window.dispatchEvent(new CustomEvent('newMessageNotification', {
      detail: { title: "New Message", message: `Message sent successfully.`, type: 'message' }
    }));

    // Dispatch real backend notification to the target teacher
    const match = activeThread.id.match(/teacher_([a-zA-Z0-9-]+)/);
    if (match) {
       const targetUserId = match[1];
       notificationService.create({
          user_id: targetUserId,
          title: "New Message",
          message: `You received a new message from ${user?.firstName} ${user?.lastName}.`,
          is_read: false
       }).catch(console.error);

       // Trigger cross-tab real-time toast
       localStorage.setItem(`notify-user-${targetUserId}`, Date.now().toString());
    }

    setInputText("");
    setSuggestedReply(null);
  };

  const generateAISuggestedReply = () => {
    setSuggestedReply(`Thank you for the update regarding ${activeThread?.studentName?.split(" ")[0]}. I appreciate the support!`);
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
