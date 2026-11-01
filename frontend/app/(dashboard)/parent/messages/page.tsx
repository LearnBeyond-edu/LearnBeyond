"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, User, Sparkles, BrainCircuit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents, useTeachers, useClasses, useParents, useTherapists } from "@/hooks/useSchool";
import { messageService, DirectMessage } from "@/services/messageService";

interface ChatThread {
  id: string;
  name: string;
  studentName?: string;
  role: "Teacher" | "Therapist";
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
  const { data: therapistsData } = useTherapists(100);

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
    const allTeachers = teachersData?.pages.flatMap((p) => p.data) ?? [];
    const allParents = parentsData?.pages.flatMap((p) => p.data) ?? [];
    const allTherapists = therapistsData?.pages.flatMap((p) => p.data) ?? [];

    const myChildrenIds = allParents
      .filter((p) => p.user_id === user?.id || p.id === user?.id)
      .map((p) => p.student_id);
    const myChildren = allStudents.filter(
      (s) => myChildrenIds.includes(s.id) || myChildrenIds.includes(s.user_id)
    );
    const defaultStudentName = myChildren[0]
      ? [myChildren[0].first_name, myChildren[0].last_name].filter(Boolean).join(" ")
      : "Student";

    // Fetch unified messages from backend API + shared store
    const allDirectMessages = await messageService.getMessages();

    // Clean up any old legacy key
    if (typeof window !== "undefined" && user?.id) {
      localStorage.removeItem(`parent-messages-${user.id}`);
    }

    const candidateContacts: {
      contactUserId: string;
      contactProfileId?: string;
      name: string;
      studentName: string;
      role: "Teacher" | "Therapist";
    }[] = [];

    const currentInstId = user?.institutionId || (user as any)?.institution_id || myChildren[0]?.institution_id;

    // 1. Show the assigned class teacher(s) for the parent's children
    myChildren.forEach((child) => {
      const childClass = allClasses.find((c) => c.id === child.class_id);
      const studentFullName =
        [child.first_name, child.last_name].filter(Boolean).join(" ") || defaultStudentName;

      if (childClass) {
        const classTeacherId =
          (childClass as any).class_teacher_id || (childClass as any).teacher_id;
        if (classTeacherId) {
          const teacher = allTeachers.find(
            (t) => (t.user_id === classTeacherId || t.id === classTeacherId) &&
                   (!currentInstId || !(t as any).institution_id || (t as any).institution_id === currentInstId)
          );
          if (teacher) {
            candidateContacts.push({
              contactUserId: teacher.user_id || teacher.id,
              contactProfileId: teacher.id,
              name:
                [teacher.first_name, teacher.last_name].filter(Boolean).join(" ") ||
                "Teacher",
              studentName: studentFullName,
              role: "Teacher",
            });
          }
        }
      }
    });

    // 2. Also ensure respective school teachers are accessible
    allTeachers.forEach((teacher) => {
      if (teacher.user_id === user?.id || teacher.id === user?.id) return;
      if (currentInstId && (teacher as any).institution_id && (teacher as any).institution_id !== currentInstId) return;
      candidateContacts.push({
        contactUserId: teacher.user_id || teacher.id,
        contactProfileId: teacher.id,
        name:
          [teacher.first_name, teacher.last_name].filter(Boolean).join(" ") ||
          (teacher as any).email ||
          "Teacher",
        studentName: defaultStudentName,
        role: "Teacher",
      });
    });

    // 3. Also include respective clinical therapists so parents can consult the therapy team
    allTherapists.forEach((therapist) => {
      if (therapist.user_id === user?.id || therapist.id === user?.id) return;
      if (currentInstId && (therapist as any).institution_id && (therapist as any).institution_id !== currentInstId) return;
      candidateContacts.push({
        contactUserId: therapist.user_id || therapist.id,
        contactProfileId: therapist.id,
        name:
          [therapist.first_name, therapist.last_name].filter(Boolean).join(" ") ||
          (therapist as any).email ||
          "Clinical Therapist",
        studentName: defaultStudentName,
        role: "Therapist",
      });
    });

    // Deduplicate candidate contacts by contactUserId
    const uniqueMap = new Map<
      string,
      { contactUserId: string; contactProfileId?: string; name: string; studentName: string; role: "Teacher" | "Therapist" }
    >();
    candidateContacts.forEach((ct) => {
      if (ct.contactUserId && !uniqueMap.has(ct.contactUserId) && ct.contactUserId !== user?.id) {
        uniqueMap.set(ct.contactUserId, ct);
      }
    });

    // Build chat threads with strictly filtered & deduplicated messages
    const builtThreads: ChatThread[] = [];
    uniqueMap.forEach(({ contactUserId, contactProfileId, name, studentName, role }) => {
      const threadMessages: { sender: "me" | "them"; text: string; time: Date }[] = [];

      allDirectMessages.forEach((m) => {
        const isFromMeToContact =
          m.sender_id === user?.id &&
          (m.recipient_id === contactUserId ||
            (contactProfileId && m.recipient_id === contactProfileId));

        const isFromContactToMe =
          (m.sender_id === contactUserId ||
            (contactProfileId && m.sender_id === contactProfileId)) &&
          m.recipient_id === user?.id;

        if (isFromMeToContact || isFromContactToMe) {
          threadMessages.push({
            sender: m.sender_id === user?.id ? "me" : "them",
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
          (u) =>
            u.sender === tm.sender &&
            u.text.trim().toLowerCase() === tm.text.trim().toLowerCase() &&
            Math.abs(u.time.getTime() - tm.time.getTime()) < 3000
        );
        if (!isDup) {
          uniqueThreadMessages.push(tm);
        }
      }

      const lastMsg =
        uniqueThreadMessages.length > 0
          ? uniqueThreadMessages[uniqueThreadMessages.length - 1].text
          : "No messages yet.";
      const lastTime =
        uniqueThreadMessages.length > 0
          ? uniqueThreadMessages[uniqueThreadMessages.length - 1].time
          : new Date();

      builtThreads.push({
        id: `thread_contact_${contactUserId}`,
        name,
        studentName,
        role,
        lastMessage: lastMsg,
        timestamp: lastTime,
        unread: false,
        teacherUserId: contactUserId,
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
  }, [studentsData, classesData, teachersData, parentsData, therapistsData, user]);

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
        sender_id: user?.id || "parent_user",
        sender_name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Parent",
        recipient_id: activeThread.teacherUserId || activeThread.id.replace('thread_contact_', '').replace('thread_teacher_', ''),
        recipient_name: activeThread.name,
        student_name: activeThread.studentName,
        text: textToSend,
        channel: activeThread.role === "Therapist" ? "staff_therapist" : "teacher_parent",
      });

      // Synchronize state cleanly
      await syncAllThreads();
    } finally {
      setIsSending(false);
    }
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
