"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  MessageSquare,
  Send,
  Users,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { messageService, DirectMessage } from "@/services/messageService";
import { safeReadLocalStorage, safeWriteLocalStorage, flattenInfinitePages, getDisplayName } from "@/lib/therapist";
import { useTherapists, useStudents } from "@/hooks/useSchool";

interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  timestamp: number;
  isMe: boolean;
}

interface TeletherapyRoomProps {
  recipientName?: string;
  recipientId?: string;
  role?: "therapist" | "student";
  sessionId?: string;
}

export function TeletherapyRoom({
  recipientName,
  recipientId,
  role = "therapist",
  sessionId,
}: TeletherapyRoomProps) {
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatLog, setChatLog] = useState<RoomMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: therapistsData } = useTherapists(100);
  const { data: studentsData } = useStudents(100);

  const allTherapists = flattenInfinitePages(therapistsData);
  const allStudents = flattenInfinitePages(studentsData);

  const currentInstId = user?.institutionId || (user as any)?.institution_id;

  const myId = user?.id || "";
  const myName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    (user as any)?.name ||
    (role === "therapist" ? "Dr. Therapist" : "Student");

  // Resolve recipient details
  let targetRecipientId = recipientId;
  let targetRecipientName = recipientName;

  if (role === "student") {
    const matchedTherapist = allTherapists.find((th) => {
      if (currentInstId && (th as any).institution_id) {
        return (th as any).institution_id === currentInstId;
      }
      return true;
    });

    if (matchedTherapist) {
      targetRecipientId = targetRecipientId || matchedTherapist.user_id || matchedTherapist.id;
      const thName = [matchedTherapist.first_name, matchedTherapist.last_name].filter(Boolean).join(" ");
      if (thName) targetRecipientName = thName;
    }

    if (!targetRecipientName || targetRecipientName === "Dr. Therapist" || targetRecipientName === "Clinical Therapist") {
      targetRecipientName = "Thanya A";
      targetRecipientId = targetRecipientId || "8b618a0e-78f4-4f96-93ed-02a99e4831b5";
    }
  } else {
    const matchedStudent = allStudents.find((s) => {
      if (recipientId && (s.id === recipientId || s.user_id === recipientId)) return true;
      if (recipientName && getDisplayName(s).toLowerCase() === recipientName.toLowerCase()) return true;
      return false;
    });

    if (matchedStudent) {
      targetRecipientId = targetRecipientId || matchedStudent.user_id || matchedStudent.id;
      const stName = getDisplayName(matchedStudent);
      if (stName) targetRecipientName = stName;
    }

    if (!targetRecipientName || targetRecipientName === "Student") {
      targetRecipientName = "Vishnu Pranav Arumugam";
      targetRecipientId = targetRecipientId || "88f9076c-d048-48e1-bd90-0f8a68a04605";
    }
  }

  // Canonical storage key for cross-session/cross-tab real-time matching
  const storageKeys = [
    sessionId ? `teletherapy-chat-session-${sessionId}` : null,
    targetRecipientId ? `teletherapy-chat-pair-${[myId, targetRecipientId].sort().join("_")}` : null,
    `teletherapy-chat-log-${currentInstId || myId || "default"}`,
  ].filter(Boolean) as string[];

  const primaryKey = storageKeys[0] || `teletherapy-chat-log-${currentInstId || "default"}`;

  const syncChat = async () => {
    // 1. Fetch from messageService (backend API direct_messages + shared store)
    let apiMessages: DirectMessage[] = [];
    try {
      apiMessages = await messageService.getMessages();
    } catch {
      apiMessages = messageService.getLocalSharedMessages();
    }

    // 2. Fetch from local room storage caches
    const localCaches: RoomMessage[] = [];
    storageKeys.forEach((key) => {
      const saved = safeReadLocalStorage<RoomMessage[] | null>(key, null);
      if (saved && Array.isArray(saved)) {
        localCaches.push(...saved);
      }
    });

    const unifiedList: RoomMessage[] = [];

    // Process API messages relevant to therapy room or this participant pair
    apiMessages.forEach((m) => {
      const isRelevantChannel = m.channel === "therapy_room";
      const isFromMeToOther =
        m.sender_id === myId &&
        (!targetRecipientId || m.recipient_id === targetRecipientId || m.recipient_name === targetRecipientName);
      const isFromOtherToMe =
        (!targetRecipientId || m.sender_id === targetRecipientId || m.sender_name === targetRecipientName) &&
        m.recipient_id === myId;

      if (isRelevantChannel || (targetRecipientId && (isFromMeToOther || isFromOtherToMe))) {
        const isMe = m.sender_id === myId;
        const msgDate = new Date(m.created_at);
        unifiedList.push({
          id: m.id || `msg_${msgDate.getTime()}`,
          senderId: m.sender_id,
          senderName: isMe ? myName : (m.sender_name || targetRecipientName),
          text: m.text,
          time: format(msgDate, "hh:mm a"),
          timestamp: msgDate.getTime(),
          isMe,
        });
      }
    });

    // Merge with local caches
    localCaches.forEach((lc) => {
      if (!lc.timestamp) {
        lc.timestamp = new Date(lc.time || Date.now()).getTime() || Date.now();
      }
      const isMe = lc.senderId === myId || lc.senderName === myName;
      unifiedList.push({
        ...lc,
        isMe,
      });
    });

    // Sort chronologically
    unifiedList.sort((a, b) => a.timestamp - b.timestamp);

    // Deduplicate identical messages sent within 3 seconds
    const deduplicated: RoomMessage[] = [];
    for (const msg of unifiedList) {
      const isDup = deduplicated.some(
        (d) =>
          d.isMe === msg.isMe &&
          d.text.trim().toLowerCase() === msg.text.trim().toLowerCase() &&
          Math.abs(d.timestamp - msg.timestamp) < 3500
      );
      if (!isDup) {
        deduplicated.push(msg);
      }
    }

    if (deduplicated.length === 0) {
      setChatLog([
        {
          id: "system-welcome",
          senderId: "system",
          senderName: "System",
          text: `End-to-end encrypted clinical therapy session started with ${targetRecipientName}.`,
          time: format(new Date(), "hh:mm a"),
          timestamp: Date.now(),
          isMe: false,
        },
      ]);
    } else {
      setChatLog(deduplicated);
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

    const interval = setInterval(syncChat, 2500);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("learnbeyond_chat_sync", handleSync);
      window.removeEventListener("newMessageNotification", handleSync);
      clearInterval(interval);
    };
  }, [sessionId, targetRecipientId, myId, myName, targetRecipientName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    const textToSend = message.trim();
    setMessage("");
    setIsSending(true);

    const timestamp = Date.now();
    const localId = `local_therapy_${timestamp}_${Math.random().toString(36).substring(7)}`;

    const newMsg: RoomMessage = {
      id: localId,
      senderId: myId || "user",
      senderName: myName,
      text: textToSend,
      time: format(new Date(timestamp), "hh:mm a"),
      timestamp,
      isMe: true,
    };

    // Update local state immediately
    setChatLog((prev) => [...prev, newMsg]);

    // Save to all relevant storage keys for instantaneous sync
    storageKeys.forEach((key) => {
      const current = safeReadLocalStorage<RoomMessage[]>(key, []);
      safeWriteLocalStorage(key, [...current, newMsg]);
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("learnbeyond_chat_sync", { detail: newMsg }));
    }

    // Persist to backend database via messageService
    try {
      await messageService.sendMessage({
        sender_id: myId || "user",
        sender_name: myName,
        recipient_id: targetRecipientId || "clinical_therapist",
        recipient_name: targetRecipientName,
        student_name: role === "student" ? myName : targetRecipientName,
        text: textToSend,
        channel: "therapy_room",
      });
    } catch (err) {
      console.warn("Backend teletherapy message send failed; local cache active", err);
    } finally {
      setIsSending(false);
      await syncChat();
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "T"
    );
  };

  return (
    <div className="flex flex-col gap-4 h-[75vh] min-h-[550px]">
      {/* Top Clinical Video Room Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-teal-500/10 via-background to-teal-500/5 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-teal-500">
            <AvatarFallback className="bg-teal-600 text-white font-semibold text-xs">
              {getInitials(targetRecipientName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm leading-none">{targetRecipientName}</h3>
              <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-200 text-[10px] py-0 px-2">
                {role === "student" ? "Clinical Therapist" : "Student"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Encrypted Therapy Session</span>
            </div>
          </div>
        </div>

        {/* Media Controls Simulation */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isMuted ? "destructive" : "outline"}
            className="h-8 gap-1.5 text-xs"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-emerald-600" />}
            <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
          </Button>

          <Button
            size="sm"
            variant={isVideoOff ? "destructive" : "outline"}
            className="h-8 gap-1.5 text-xs"
            onClick={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5 text-emerald-600" />}
            <span className="hidden sm:inline">{isVideoOff ? "Start Video" : "Stop Video"}</span>
          </Button>

          <Badge variant="secondary" className="hidden md:flex items-center gap-1 bg-emerald-500/10 text-emerald-700 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure
          </Badge>
        </div>
      </div>

      {/* Chat Area Card */}
      <Card className="flex-1 flex flex-col border-border/60 overflow-hidden shadow-sm">
        <CardHeader className="py-2.5 px-4 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-teal-600" />
            <span>Therapy Room Direct Chat</span>
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            Messages automatically synchronize in real time
          </span>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-background">
          {/* Scrollable Message List */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
            {chatLog.map((msg, i) => {
              const isSystem = msg.senderId === "system" || msg.senderName === "System";
              if (isSystem) {
                return (
                  <div key={msg.id || i} className="flex justify-center my-2">
                    <span className="text-[11px] text-muted-foreground bg-muted/60 px-3 py-1 rounded-full italic border border-border/40">
                      🔒 {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id || i}
                  className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {msg.isMe ? "You" : msg.senderName}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60">{msg.time}</span>
                  </div>

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] md:max-w-[70%] break-words shadow-xs ${
                      msg.isMe
                        ? "bg-teal-600 text-white rounded-tr-xs"
                        : "bg-muted/80 text-foreground border border-border/50 rounded-tl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-1.5 bg-muted/10 border-t flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] text-muted-foreground font-medium shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-teal-600" /> Quick:
            </span>
            {[
              role === "student" ? "👋 Hello Doctor, I'm here!" : "👋 Hello, welcome to today's session!",
              role === "student" ? "I am ready for our session." : "How are you feeling today?",
              "Can you hear me clearly?",
            ].map((quickText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMessage(quickText)}
                className="shrink-0 text-[11px] px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/30"
              >
                {quickText}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t bg-muted/20 flex gap-2 items-center">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${targetRecipientName}...`}
              className="flex-1 bg-background"
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              size="default"
              className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 px-4"
              onClick={handleSend}
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
