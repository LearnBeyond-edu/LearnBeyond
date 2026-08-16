"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, User, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents, useParents, useClasses, useTeachers } from "@/hooks/useSchool";
import { notificationService } from "@/services/platformService";

interface ChatThread {
  id: string;
  name: string;
  studentName?: string;
  role: "Parent";
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
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

  useEffect(() => {
    const allStudents = studentsData?.pages.flatMap((p) => p.data) ?? [];
    const allClasses = classesData?.pages.flatMap((p) => p.data) ?? [];
    const allParents = parentsData?.pages.flatMap((p) => p.data) ?? [];
    const allTeachers = teachersData?.pages.flatMap((p) => p.data) ?? [];

    const myProfile = allTeachers.find(t => t.user_id === user?.id);
    const myClasses = allClasses.filter(c => c.teacher_id === user?.id || c.teacher_id === myProfile?.id);
    const myClassIds = myClasses.map(c => c.id);
    const myStudents = allStudents.filter(s => myClassIds.includes(s.class_id));
    const myStudentIds = myStudents.map(s => s.id);

    const savedThreads = localStorage.getItem(`teacher-messages-${user?.id}`);
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

    const parentMessagesMap = new Map();
    if (typeof window !== "undefined") {
       for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('parent-messages-')) {
             try {
                const pParsed = JSON.parse(localStorage.getItem(key) || "[]");
                pParsed.forEach((t: any) => {
                   if (t.id.includes(`teacher_${user?.id}`)) {
                      const parentUserId = key.replace('parent-messages-', '');
                      parentMessagesMap.set(parentUserId, t);
                   }
                });
             } catch(e) {}
          }
       }
    }

    myStudents.forEach(student => {
      const parentProfile = allParents.find(p => p.student_id === student.id || p.student_id === student.user_id);
      
      if (parentProfile) {
        const threadId = `parent_${parentProfile.id}_child_${student.id}`;
        let threadToPush: ChatThread;
        
        if (existingThreads[threadId]) {
          threadToPush = existingThreads[threadId];
          // Always ensure the latest parent name is used just in case
          threadToPush.name = [parentProfile.first_name, parentProfile.last_name].filter(Boolean).join(" ") || "Parent";
          threadToPush.studentName = [student.first_name, student.last_name].filter(Boolean).join(" ");
        } else {
          threadToPush = {
              id: threadId,
              name: [parentProfile.first_name, parentProfile.last_name].filter(Boolean).join(" ") || "Parent",
              studentName: [student.first_name, student.last_name].filter(Boolean).join(" "),
              role: "Parent",
              lastMessage: "No messages yet.",
              timestamp: new Date(),
              unread: false,
              messages: []
          };
        }

        generatedThreads.push(threadToPush);
      }
    });

    // Also include ANY threads that parents have initiated, even if DB relations are missing
    parentMessagesMap.forEach((parentThread, parentUserId) => {
      const parentProfile = allParents.find(p => p.user_id === parentUserId);
      const studentMatch = parentThread.id.match(/child_([a-zA-Z0-9-]+)/);
      const childId = studentMatch ? studentMatch[1] : null;
      const student = allStudents.find(s => s.id === childId);
      
      const threadId = `parent_${parentProfile?.id || parentUserId}_child_${childId || 'unknown'}`;
      
      let threadToPush = generatedThreads.find(t => t.id === threadId);
      if (!threadToPush) {
        if (existingThreads[threadId]) {
          threadToPush = existingThreads[threadId];
        } else {
          threadToPush = {
            id: threadId,
            name: parentProfile ? [parentProfile.first_name, parentProfile.last_name].filter(Boolean).join(" ") : parentThread.name || "Unknown Parent",
            studentName: student ? [student.first_name, student.last_name].filter(Boolean).join(" ") : parentThread.studentName || "Unknown Student",
            role: "Parent",
            lastMessage: "No messages yet.",
            timestamp: new Date(),
            unread: false,
            messages: []
          };
        }
        generatedThreads.push(threadToPush);
      }
    });

    // Sync messages for all generated threads
    generatedThreads.forEach(threadToPush => {
      // We need to find the corresponding parent thread
      const match = threadToPush.id.match(/parent_([a-zA-Z0-9-]+)_child_([a-zA-Z0-9-]+)/);
      const parentId = match ? match[1] : null;
      
      let threadFromParent: any = null;
      parentMessagesMap.forEach((pt, pUid) => {
         if (pUid === parentId) {
             threadFromParent = pt;
         }
      });

      if (threadFromParent) {
         const newMessages = [...threadToPush.messages];
         threadFromParent.messages.forEach((m: any) => {
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
      }
    });

    // SAFETY NET: Ensure any existing threads from localStorage are preserved
    Object.values(existingThreads).forEach(t => {
       if (!generatedThreads.find(g => g.id === t.id)) {
           // We need to merge parent messages into this existing thread too, if any
           const match = t.id.match(/parent_([a-zA-Z0-9-]+)_child_([a-zA-Z0-9-]+)/);
           const parentId = match ? match[1] : null;
           let threadFromParent: any = null;
           parentMessagesMap.forEach((pt, pUid) => {
              const pProf = allParents.find(p => p.user_id === pUid);
              if (pProf?.id === parentId || pUid === parentId) {
                  threadFromParent = pt;
              }
           });
           
           if (threadFromParent) {
              const newMessages = [...t.messages];
              threadFromParent.messages.forEach((m: any) => {
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
                 t.messages = newMessages;
                 t.lastMessage = lastMsg.text;
                 t.timestamp = lastMsg.time;
              }
           }
           generatedThreads.push(t);
       }
    });

    const uniqueThreadsMap = new Map<string, ChatThread>();
    generatedThreads.forEach(t => {
       const key = `${t.name}_${t.studentName}`;
       const existing = uniqueThreadsMap.get(key);
       if (!existing || t.messages.length > existing.messages.length) {
           uniqueThreadsMap.set(key, t);
       }
    });
    const finalThreads = Array.from(uniqueThreadsMap.values());

    if (finalThreads.length > 0) {
      setThreads(finalThreads.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      if (!activeThreadId) setActiveThreadId(finalThreads[0].id);
    } else {
      setThreads([]);
      setActiveThreadId("");
    }
  }, [studentsData, classesData, parentsData, teachersData, user]);

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
      localStorage.setItem(`teacher-messages-${user?.id}`, JSON.stringify(newThreads));
      return newThreads;
    });

    window.dispatchEvent(new CustomEvent('newMessageNotification', {
      detail: { title: "New Message", message: `Message sent successfully.`, type: 'message' }
    }));

    setInputText("");
    setSuggestedReply(null);
  };

  const generateAISuggestedReply = () => {
    setSuggestedReply(`Thank you for reaching out regarding ${activeThread?.studentName?.split(" ")[0]}. We are seeing great progress in class!`);
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
