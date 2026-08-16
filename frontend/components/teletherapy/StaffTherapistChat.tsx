"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Paperclip, Search, BrainCircuit, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { safeReadLocalStorage, safeWriteLocalStorage } from "@/lib/therapist";

export function StaffTherapistChat({ defaultRecipient = "Dr. Therapist" }: { defaultRecipient?: string }) {
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [activeThread, setActiveThread] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isTeacher = user?.role?.toLowerCase().includes("teacher");
  const myName = user?.firstName || (isTeacher ? "Teacher" : "Therapist");
  const otherName = isTeacher ? "Dr. Therapist" : "Mr. Smith (Teacher)";

  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    const loadChat = () => {
      const saved = safeReadLocalStorage<any[] | null>("staff-therapist-chat-log", null);
      if (saved && saved.length > 0) {
        setThreads(saved);
      } else {
        setThreads([
          {
            id: 0,
            studentName: "General Discussion",
            recipient: otherName,
            lastActive: new Date().toISOString(),
            messages: [
              { sender: "System", text: "Secure clinical discussion channel created.", time: format(new Date(), "hh:mm a") }
            ]
          }
        ]);
      }
    };
    
    loadChat();
    window.addEventListener("storage", loadChat);
    return () => window.removeEventListener("storage", loadChat);
  }, []);

  const handleSend = () => {
    if (!message.trim() || !threads.length) return;
    
    const newThreads = [...threads];
    newThreads[activeThread].messages.push({
      sender: myName,
      text: message,
      time: format(new Date(), "hh:mm a")
    });
    newThreads[activeThread].lastActive = new Date().toISOString();
    
    setThreads(newThreads);
    safeWriteLocalStorage("staff-therapist-chat-log", newThreads);
    window.dispatchEvent(new Event("storage"));
    
    setMessage("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !threads.length) return;

    const newThreads = [...threads];
    newThreads[activeThread].messages.push({
      sender: myName,
      text: `📎 Attached File: ${file.name}`,
      time: format(new Date(), "hh:mm a")
    });
    newThreads[activeThread].lastActive = new Date().toISOString();
    
    setThreads(newThreads);
    safeWriteLocalStorage("staff-therapist-chat-log", newThreads);
    window.dispatchEvent(new Event("storage"));
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeData = threads[activeThread];

  return (
    <div className="flex h-[70vh] border rounded-xl overflow-hidden bg-background shadow-sm">
      {/* Sidebar Threads */}
      <div className="w-80 border-r flex flex-col bg-muted/10 shrink-0">
        <div className="p-4 border-b bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-9" placeholder="Search discussions..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread, idx) => (
            <div 
              key={idx} 
              className={`p-4 border-b cursor-pointer transition-colors ${activeThread === idx ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted/30 border-l-4 border-l-transparent'}`}
              onClick={() => setActiveThread(idx)}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-sm">{thread.studentName}</p>
                <span className="text-[10px] text-muted-foreground">{format(new Date(thread.lastActive), "MMM d")}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                {isTeacher ? <BrainCircuit className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                {thread.recipient}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-background z-10">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {activeData?.studentName?.[0] || "D"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold">{activeData?.studentName || "Discussion"}</p>
              <p className="text-xs text-muted-foreground">Discussion with {activeData?.recipient}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Paperclip className="h-4 w-4" /> View Files
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeData?.messages?.map((msg: any, i: number) => {
            const isMe = msg.sender === myName;
            return (
              <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground">{msg.sender}</span>
                  <span className="text-[9px] text-muted-foreground/60">{msg.time}</span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[80%] ${
                  msg.sender === "System" ? "bg-muted text-muted-foreground italic text-center mx-auto" :
                  isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your clinical update or question..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button className="shrink-0 rounded-xl px-6" onClick={handleSend} disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
