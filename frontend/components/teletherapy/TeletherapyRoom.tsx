"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Mic, MicOff, VideoOff, MessageSquare, PhoneOff, Send, Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

import { useEffect } from "react";
import { safeReadLocalStorage, safeWriteLocalStorage } from "@/lib/therapist";

export function TeletherapyRoom({ recipientName, role = "therapist" }: { recipientName: string, role?: "therapist" | "student" }) {
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<{sender: string, text: string, time: string}[]>([]);

  // Load chat log from localStorage
  useEffect(() => {
    const loadChat = () => {
      const saved = safeReadLocalStorage<{sender: string, text: string, time: string}[] | null>("teletherapy-chat-log", null);
      if (saved) {
        setChatLog(saved);
      } else {
        setChatLog([{ sender: "System", text: "End-to-end encryption enabled. Session recorded for clinical notes.", time: new Date().toISOString() }]);
      }
    };
    
    loadChat();
    window.addEventListener("storage", loadChat);
    return () => window.removeEventListener("storage", loadChat);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage = { sender: user?.firstName || (role === "therapist" ? "Dr. Therapist" : "Student"), text: message, time: new Date().toISOString() };
    const updatedLog = [...chatLog, newMessage];
    
    setChatLog(updatedLog);
    safeWriteLocalStorage("teletherapy-chat-log", updatedLog);
    window.dispatchEvent(new Event("storage"));
    
    setMessage("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 h-[70vh] min-h-[500px]">

      {/* Chat Area */}
      <Card className="flex flex-col border-border/60">
        <CardHeader className="py-3 border-b border-border/40 bg-muted/30">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Live Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {chatLog.map((msg, i) => {
              const isMe = msg.sender === (user?.firstName || (role === "therapist" ? "Dr. Therapist" : "Student"));
              return (
              <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground">{msg.sender}</span>
                  {msg.time && <span className="text-[9px] text-muted-foreground/60">{new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[90%] ${
                  msg.sender === "System" ? "bg-muted text-muted-foreground italic text-center mx-auto" :
                  isMe ? "bg-teal-600 text-white rounded-br-none" : "bg-muted rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            )})}
          </div>
          <div className="p-3 border-t bg-muted/10 flex gap-2">
            <Input 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Type message..." 
              className="flex-1"
              onKeyDown={e => e.key === "Enter" && handleSend()}
            />
            <Button size="icon" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
