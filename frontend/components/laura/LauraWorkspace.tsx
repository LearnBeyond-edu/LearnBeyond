"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLauraStore, ChatSession, Message, ChatFile, MemoryItem } from "@/store/useLauraStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, Send, Mic, MicOff, Paperclip, Pin, Archive, Trash2, Heart, Share2, Download,
  Volume2, VolumeX, Edit2, Check, X, Search, Info, Plus, Menu, Settings as SettingsIcon,
  ChevronRight, Circle, FileText, Image as ImageIcon, Video, HelpCircle, User, Bot, AlertTriangle,
  Flame, TrendingUp, Cpu, Smile, Camera, Copy, RefreshCw, ThumbsUp, ThumbsDown, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { generateAIResponse } from "@/services/aiService";

// Role-specific suggested prompts
const SUGGESTED_PROMPTS = {
  "Platform Admin": [
    { text: "Analyze platform usage metrics", desc: "View detailed API usage and load distribution." },
    { text: "Predict subscription growth for Q3", desc: "Use current registration rates to estimate growth." },
    { text: "Generate system uptime report", desc: "Summarize performance across all clusters." },
  ],
  "Institution Admin": [
    { text: "Generate teacher activity insights", desc: "Detect classroom lesson preparation metrics." },
    { text: "Draft new policy announcement", desc: "Create a announcement template for school policies." },
    { text: "Analyze monthly student attendance", desc: "Highlight grades showing attendance drops." },
  ],
  "Teacher": [
    { text: "Create lesson plan for Photosynthesis", desc: "Generate multi-sensory curriculum for Grade 4." },
    { text: "Draft worksheet on fractions", desc: "Include visual exercises and self-assessment prompts." },
    { text: "Detect learning style deficits", desc: "Flag students needing kinesthetic modifications." },
  ],
  "Student": [
    { text: "Explain quadratic equations simply", desc: "Provide visual and step-by-step calculations." },
    { text: "Generate practice quiz for chemistry", desc: "Include 5 questions with detailed solutions." },
    { text: "Create revision mind map for history", desc: "Summarize key events of the American Revolution." },
  ],
  "Parent": [
    { text: "Summarize child's math progress", desc: "Get simplified breakdown of current grades." },
    { text: "How to support focus during homework?", desc: "Actionable tips for home workspace setup." },
    { text: "Explain recent behavior alert", desc: "Understand context behind classroom notifications." },
  ],
  "Therapist": [
    { text: "Analyze fine motor progress", desc: "Review writing speed and finger dexterity logs." },
    { text: "Draft sensory diet recommendation", desc: "Create classroom strategies for sensory-seeking children." },
    { text: "Suggest occupational therapy goals", desc: "Formulate SMART goals for spatial orientation." },
  ]
};

// Detailed responses for each prompt/category to simulate real AI capabilities
const MOCK_AI_RESPONSES: Record<string, string> = {
  default: "I have analyzed the current context and parameters. Based on educational and clinical standards, I recommend implementing a structured intervention plan. Let me know if you would like to customize the templates or generate specific assessments.",
  
  // Teacher
  "Create lesson plan for Photosynthesis": `### Lesson Plan: Photosynthesis (Grade 4 - Multi-Sensory Approach)
  
**Objective:** Students will explain the chemical formula of photosynthesis and list ingredients plants need.

#### 1. Sensory Breakdown (VAKT Mode)
*   **Visual:** Show a diagram of leaves with sunbeams, water droplets, and CO2 particles.
*   **Auditory:** Narrate the story of "Sunny the Chloroplast" converting food.
*   **Kinesthetic:** Students perform "leaf poses" absorbing sunshine and breathing out oxygen.
*   **Tactile:** Allow students to touch green leaf textures and place starch indicator drops on starch sheets.

#### 2. Assessment Quiz
1. What gas do plants absorb? (Answer: Carbon Dioxide)
2. Where does photosynthesis occur? (Answer: Chloroplasts)

[Math: 6CO_2 + 6H_2O + Light \\rightarrow C_6H_{12}O_6 + 6O_2]`,

  // Student
  "Explain quadratic equations simply": `### Quadratic Equations Explained Simply

A quadratic equation is like a pathway of a thrown baseball. It rises, bends, and falls.

The general form is:
[Math: ax^2 + bx + c = 0]

*   **x** represents the unknown distance.
*   **a, b, and c** are coefficients defining the trajectory shape.

To find the roots, we use the quadratic formula:
[Math: x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}]

| Coefficient | Action on Parabola |
|---|---|
| a > 0 | Opens upwards (U-shape) |
| a < 0 | Opens downwards (inverted U) |`,

  // Therapist
  "Analyze fine motor progress": `### Fine Motor Progress Analysis (OTR/L Summary)

Based on recent session logs, the student has demonstrated positive adaptation in hand-eye coordination but continues to require support for pencil grasp pressure.

#### Recommended Actions:
1. **Pinch Strength Exercises**: Use modeling clay exercises for 5 minutes daily before writing tasks.
2. **Specialized Grips**: Introduce triangular soft pencil grips to encourage a dynamic tripod pinch.
3. **Pacing Guidance**: Allow additional time (1.5x) for hand-written tests or provide digital typing fallbacks.`,
};

export default function LauraAIWorkspace() {
  const { user } = useAuthStore();
  const role = user?.role || "Student";
  
  const {
    sessions, activeSessionId, settings, memories, insights,
    isRecording, isPlayingSpeech, isGenerating, currentPlaybackMessageId,
    setActiveSessionId, createSession, addMessage, updateMessage, deleteMessage,
    renameSession, deleteSession, togglePinSession, toggleArchiveSession,
    toggleFavoriteSession, toggleShareSession, uploadFileToSession, deleteFileFromSession,
    updateSettings, addMemory, deleteMemory, setIsRecording, setIsPlayingSpeech,
    setCurrentPlaybackMessageId, setIsGenerating, setSessions
  } = useLauraStore();
  
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResult, setSearchResult] = useState<Message[]>([]);
  const [voicePlaybackSpeed, setVoicePlaybackSpeed] = useState(1.0);
  
  // File Upload State
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Backend Synchronization
  const isLoadedRef = useRef(false);
  
  useEffect(() => {
    const fetchLauraState = async () => {
      try {
        const { default: api } = await import("@/services/api");
        const res = await api.get('/auth/me');
        const userData = res.data.data.user;
        if (userData.laura_state) {
          const state = typeof userData.laura_state === 'string' ? JSON.parse(userData.laura_state) : userData.laura_state;
          if (state.sessions && state.sessions.length > 0) {
            setSessions(state.sessions);
            updateSettings(state.settings);
            if (state.activeSessionId) setActiveSessionId(state.activeSessionId);
            // We could set memories and insights here too, but these are mostly hardcoded/derived for now
          }
        }
      } catch (err) {
        console.error("Failed to load Laura state from backend", err);
      } finally {
        isLoadedRef.current = true;
      }
    };
    if (user?.id) fetchLauraState();
    else isLoadedRef.current = true;
  }, [user?.id]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    const saveLauraState = async () => {
      try {
        const { default: api } = await import("@/services/api");
        const stateToSave = {
          sessions,
          activeSessionId,
          settings,
          memories,
          insights
        };
        await api.put('/auth/profile', { laura_state: stateToSave });
      } catch (err) {
        console.error("Failed to save Laura state to backend", err);
      }
    };
    
    const timeout = setTimeout(saveLauraState, 1500);
    return () => clearTimeout(timeout);
  }, [sessions, activeSessionId, settings, memories, insights]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, isGenerating]);

  // Ensure there is at least one active chat session for this role
  useEffect(() => {
    const roleSessions = sessions.filter(s => s.role === role && !s.archived);
    if (roleSessions.length === 0) {
      createSession(role, "General");
    } else if (!activeSessionId) {
      setActiveSessionId(roleSessions[0].id);
    }
  }, [role, sessions, activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions.find(s => s.role === role && !s.archived);

  // File Uploader
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0] && activeSession) {
      const file = e.dataTransfer.files[0];
      const newFile: ChatFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type.split("/")[1] || "document"
      };
      uploadFileToSession(activeSession.id, newFile);
      toast.success(`Uploaded ${file.name}`);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeSession) {
      const file = e.target.files[0];
      const newFile: ChatFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type.split("/")[1] || "document"
      };
      uploadFileToSession(activeSession.id, newFile);
      toast.success(`Uploaded ${file.name}`);
    }
  };

  // Streaming response simulation
  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || !activeSession || isGenerating) return;

    setInputText("");
    addMessage(activeSession.id, {
      role: "user",
      content: query,
    });

    setIsGenerating(true);

    try {
      const isGroqModel = settings.model.toLowerCase().includes("groq") || settings.model.toLowerCase().includes("llama");
      const systemPrompt = `You are Laura AI, an educational assistant in the LearnBeyond platform. The user is a ${role}. Provide a helpful, educational response. Use markdown formatting.`;
      const fullPrompt = `${systemPrompt}\n\nUser: ${query}`;
      
      const aiResponse = await generateAIResponse(fullPrompt, isGroqModel);
      
      const newMsgId = `msg-${Date.now()}`;
      addMessage(activeSession.id, {
        role: "assistant",
        content: "",
        citations: [
          { id: "cit-1", title: "LearnBeyond Core AI Guidelines", source: "System Documentation" }
        ]
      });

      let currentContent = "";
      const words = aiResponse.split(" ");
      let wordIdx = 0;

      const interval = setInterval(() => {
        if (wordIdx < words.length) {
          currentContent += (wordIdx === 0 ? "" : " ") + words[wordIdx];
          const session = useLauraStore.getState().sessions.find(s => s.id === activeSession.id);
          if (session && session.messages.length > 0) {
            const lastMsg = session.messages[session.messages.length - 1];
            updateMessage(activeSession.id, lastMsg.id, { content: currentContent });
          }
          wordIdx++;
        } else {
          clearInterval(interval);
          setIsGenerating(false);
        }
      }, 30); // Faster streaming
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      toast.error("AI Generation failed. Please check API keys.");
    }
  };

  // Voice / STT Mock
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.info("Voice transcription stopped");
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
          toast.warning("Listening... Speak now");
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? prev + " " + transcript : transcript));
        };

        recognition.onend = () => {
          setIsRecording(false);
          toast.success("Voice transcribed successfully");
        };

        recognition.onerror = (event: any) => {
          setIsRecording(false);
          toast.error("Speech recognition error: " + event.error);
        };

        recognition.start();
      } else {
        toast.error("Speech recognition is not supported in this browser.");
      }
    }
  };

  // TTS / Speech Synthesis
  const speakText = (text: string, msgId: string) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      setCurrentPlaybackMessageId(null);
      return;
    }

    const cleanText = text.replace(/\[Math:.*?\]/g, "").replace(/#|`|\*/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voicePlaybackSpeed;
    
    utterance.onend = () => {
      setIsPlayingSpeech(false);
      setCurrentPlaybackMessageId(null);
    };

    speechUtteranceRef.current = utterance;
    setIsPlayingSpeech(true);
    setCurrentPlaybackMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Export Chat
  const exportChat = () => {
    if (!activeSession) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeSession, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeSession.title.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Chat exported successfully");
  };

  // Math & Markdown parser
  const renderFormattedContent = (content: string) => {
    if (!content) return null;
    
    // Simple custom parsers
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // LaTeX block
      if (line.trim().startsWith("[Math:") && line.trim().endsWith("]")) {
        const mathContent = line.replace("[Math:", "").replace("]", "");
        return (
          <div key={idx} className="my-3 p-3 bg-muted/60 rounded-xl text-center font-mono text-sm overflow-x-auto text-teal-600 border border-teal-500/10">
            {mathContent}
          </div>
        );
      }
      
      // Tables
      if (line.startsWith("|")) {
        const cells = line.split("|").filter(Boolean).map(c => c.trim());
        return (
          <div key={idx} className="overflow-x-auto my-2">
            <table className="min-w-full divide-y border text-xs">
              <tbody className="divide-y">
                <tr className="bg-muted/30">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 font-medium">{cell}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );
      }

      // Headers
      if (line.startsWith("###")) {
        return <h3 key={idx} className="text-sm font-bold mt-3 mb-1 text-teal-600">{line.replace("###", "").trim()}</h3>;
      }
      if (line.startsWith("####")) {
        return <h4 key={idx} className="text-xs font-bold mt-2 mb-1 text-muted-foreground">{line.replace("####", "").trim()}</h4>;
      }

      // Lists
      if (line.startsWith("*") || line.startsWith("-")) {
        return <li key={idx} className="ml-4 list-disc text-xs my-0.5">{line.substring(1).trim()}</li>;
      }

      return <p key={idx} className="text-xs leading-relaxed my-1">{line}</p>;
    });
  };

  // Search logic
  const handleSearch = () => {
    if (!searchQuery) return;
    const results: Message[] = [];
    sessions.forEach(s => {
      s.messages.forEach(m => {
        if (m.content.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push(m);
        }
      });
    });
    setSearchResult(results);
  };

  return (
    <div className="max-w-7xl mx-auto h-[80vh] flex flex-col md:flex-row gap-6">
      
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-64 flex flex-col gap-4 border-r border-border/40 pr-6 flex-shrink-0">
        <Button onClick={() => createSession(role, "General")} className="bg-teal-600 hover:bg-teal-700 text-white gap-2 w-full">
          <Plus className="h-4 w-4" /> New Chat
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search chats..." className="pl-9 h-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        {/* Categories */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Categories</p>
          <div className="flex flex-wrap gap-1">
            {["all", "General", "Clinical", "Lesson", "Homework"].map(cat => (
              <Badge key={cat} variant={activeCategory === cat ? "default" : "outline"}
                className="cursor-pointer text-[10px]" onClick={() => setActiveCategory(cat)}>
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Pinned Chats */}
          {sessions.filter(s => s.role === role && s.pinned && !s.archived).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-teal-600 flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned</p>
              {sessions.filter(s => s.role === role && s.pinned && !s.archived).map(s => (
                <div key={s.id} onClick={() => setActiveSessionId(s.id)}
                  className={`flex justify-between items-center p-2.5 rounded-xl text-xs cursor-pointer border transition-colors ${
                    s.id === activeSession?.id ? "bg-teal-500/10 border-teal-500/20 text-teal-700" : "bg-card hover:bg-muted/40"
                  }`}>
                  <span className="truncate flex-1 pr-2">{s.title}</span>
                  <Pin className="h-3 w-3 text-teal-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Recent Chats */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground">Recent Conversations</p>
            {sessions.filter(s => s.role === role && !s.pinned && !s.archived).length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic">No recent chats</p>
            ) : (
              sessions.filter(s => s.role === role && !s.pinned && !s.archived).map(s => (
                <div key={s.id} onClick={() => setActiveSessionId(s.id)}
                  className={`flex justify-between items-center p-2.5 rounded-xl text-xs cursor-pointer border transition-colors ${
                    s.id === activeSession?.id ? "bg-teal-500/10 border-teal-500/20 text-teal-700" : "bg-card hover:bg-muted/40"
                  }`}>
                  {editingSessionId === s.id ? (
                    <Input className="h-6 text-xs p-1" value={editTitleText}
                      onChange={e => setEditTitleText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          renameSession(s.id, editTitleText);
                          setEditingSessionId(null);
                        }
                      }}
                      onBlur={() => setEditingSessionId(null)}
                      autoFocus
                    />
                  ) : (
                    <span className="truncate flex-1 pr-2">{s.title}</span>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-transparent" onClick={(e) => {
                      e.stopPropagation();
                      setEditingSessionId(s.id);
                      setEditTitleText(s.title);
                    }}><Edit2 className="h-3 w-3 text-muted-foreground hover:text-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-transparent" onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(s.id);
                    }}><Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" /></Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="border-t pt-3 flex gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger render={<Button variant="outline" className="w-full text-xs gap-1.5 h-8" />}>
              <SettingsIcon className="h-3.5 w-3.5" /> settings
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Laura AI Settings</DialogTitle><DialogDescription>Configure model triggers and UI properties.</DialogDescription></DialogHeader>
              <div className="space-y-4 py-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold">Model Select</label>
                  <Select value={settings.model} onValueChange={(val) => updateSettings({ model: val })}>
                    <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gemini 3.5 Flash">Gemini 3.5 Flash</SelectItem>
                      <SelectItem value="Gemini 3.1 Pro">Gemini 3.1 Pro</SelectItem>
                      <SelectItem value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Privacy Mode</p>
                    <p className="text-[10px] text-muted-foreground">Limit chat log uploads</p>
                  </div>
                  <Switch checked={settings.privacyMode} onCheckedChange={(checked) => updateSettings({ privacyMode: checked })} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col border rounded-3xl overflow-hidden bg-card/40 backdrop-blur-md relative"
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
        
        {dragActive && (
          <div className="absolute inset-0 bg-teal-500/10 border-2 border-dashed border-teal-500 z-50 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-2">
              <Paperclip className="h-10 w-10 text-teal-600 animate-bounce mx-auto" />
              <p className="font-bold text-teal-700 text-sm">Drop your document or image here</p>
            </div>
          </div>
        )}

        {/* Chat Header */}
        <div className="h-14 border-b px-4 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600 animate-pulse" />
            <h2 className="font-semibold text-sm truncate">{activeSession?.title}</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => activeSession && togglePinSession(activeSession.id)}>
              <Pin className={`h-4 w-4 ${activeSession?.pinned ? 'text-teal-600' : 'text-muted-foreground'}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={exportChat}>
              <Download className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeSession?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                <Sparkles className="h-8 w-8 text-teal-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Talk with Laura</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  I adapt automatically to your role as a <strong>{role}</strong>. Ask me anything, draft plans, generate questions, or analyze files.
                </p>
              </div>
              <div className="grid gap-2 w-full">
                {SUGGESTED_PROMPTS[role as keyof typeof SUGGESTED_PROMPTS]?.map((prompt, i) => (
                  <button key={i} onClick={() => handleSend(prompt.text)}
                    className="w-full text-left p-3 text-xs bg-card hover:bg-muted/40 border rounded-2xl transition-all flex justify-between items-center group">
                    <div>
                      <p className="font-semibold group-hover:text-teal-600 transition-colors">{prompt.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{prompt.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSession?.messages.map((m, i) => (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-teal-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-2`}>
                    <div className={`p-4 rounded-3xl border transition-all ${
                      m.role === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-md border-transparent shadow-sm'
                        : 'bg-card border-border/60 rounded-tl-md shadow-sm'
                    }`}>
                      {m.role === 'user' ? (
                        <p className="text-xs leading-relaxed">{m.content}</p>
                      ) : (
                        <div className="space-y-2">
                          {renderFormattedContent(m.content)}
                        </div>
                      )}
                    </div>
                    {/* Citations */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="flex gap-2 flex-wrap items-center mt-1 pl-1">
                        <span className="text-[10px] text-muted-foreground font-semibold">Citations:</span>
                        {m.citations.map(c => (
                          <Badge key={c.id} variant="outline" className="text-[10px] gap-1 hover:bg-muted/50 cursor-pointer bg-muted/20">
                            <Info className="h-3 w-3 text-teal-600" /> {c.title}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {/* Actions */}
                    {m.role === 'assistant' && m.content.length > 0 && (
                      <div className="flex gap-2 pl-1 text-muted-foreground">
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-transparent" onClick={() => speakText(m.content, m.id)}>
                          {isPlayingSpeech && currentPlaybackMessageId === m.id ? (
                            <VolumeX className="h-3.5 w-3.5 text-teal-600" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5 hover:text-foreground" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-transparent" onClick={() => {
                          navigator.clipboard.writeText(m.content);
                          toast.success("Copied to clipboard");
                        }}><Copy className="h-3.5 w-3.5 hover:text-foreground" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-transparent" onClick={() => handleSend(activeSession.messages[i-1]?.content)}>
                          <RefreshCw className="h-3.5 w-3.5 hover:text-foreground" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-teal-600 animate-bounce" />
                  </div>
                  <div className="p-4 bg-muted/60 border rounded-3xl rounded-tl-md flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t space-y-3 bg-muted/10">
          {/* Preview Uploads */}
          {activeSession && activeSession.files.length > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              {activeSession.files.map(file => (
                <Badge key={file.id} variant="secondary" className="gap-1.5 text-xs py-1 bg-teal-500/5 text-teal-700 border-teal-200">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <X className="h-3 w-3 hover:text-red-500 cursor-pointer" onClick={() => deleteFileFromSession(activeSession.id, file.id)} />
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-card border rounded-2xl p-2 flex flex-col focus-within:ring-2 focus-within:ring-teal-500/30 transition-shadow">
              <Textarea placeholder="Ask Laura AI..." className="min-h-[40px] max-h-[160px] border-none bg-transparent resize-none focus-visible:ring-0 p-2 text-xs"
                value={inputText} onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="flex justify-between items-center mt-2 border-t pt-2 px-1">
                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={triggerFileInput}>
                    <Paperclip className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={toggleRecording}>
                    {isRecording ? (
                      <MicOff className="h-4 w-4 text-red-500 animate-pulse" />
                    ) : (
                      <Mic className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </Button>
                </div>
                <Button onClick={() => handleSend()} disabled={!inputText.trim() && (!activeSession || activeSession.files.length === 0)}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-8 px-4 text-xs font-semibold">
                  <Send className="h-3.5 w-3.5 mr-1.5" /> Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-full md:w-72 flex flex-col gap-4 border-l border-border/40 pl-6 flex-shrink-0 overflow-y-auto pr-1">
        {/* Suggested Prompts */}
        <Card className="border-border/60 bg-gradient-to-b from-teal-500/5 to-transparent">
          <CardHeader className="pb-3 border-b border-border/40"><CardTitle className="text-xs font-bold">Suggested for {role}</CardTitle></CardHeader>
          <CardContent className="pt-4 space-y-2">
            {SUGGESTED_PROMPTS[role as keyof typeof SUGGESTED_PROMPTS]?.slice(0, 3).map((prompt, i) => (
              <button key={i} onClick={() => handleSend(prompt.text)}
                className="w-full text-left p-3 text-[11px] bg-card hover:bg-muted/40 border rounded-2xl transition-all">
                <p className="font-semibold">{prompt.text}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{prompt.desc}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Memory */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/40 flex flex-row justify-between items-center">
            <CardTitle className="text-xs font-bold">Memory & Context</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {memories.map(mem => (
              <div key={mem.id} className="flex justify-between items-start p-2 rounded-xl bg-muted/30 border text-[11px]">
                <div className="space-y-0.5">
                  <p className="font-bold text-teal-600">{mem.key}</p>
                  <p className="text-muted-foreground leading-relaxed">{mem.value}</p>
                </div>
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500 cursor-pointer" onClick={() => deleteMemory(mem.id)} />
              </div>
            ))}
            <Button variant="outline" className="w-full text-xs h-8 border-dashed" onClick={() => addMemory("Focus Method", "Prefers hands-on experiments", "preference")}>
              Add Context Factor
            </Button>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/40"><CardTitle className="text-xs font-bold">Daily Analytics</CardTitle></CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Productivity Score</span>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold">{insights.productivityScore}%</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {insights.dailySummary}
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
