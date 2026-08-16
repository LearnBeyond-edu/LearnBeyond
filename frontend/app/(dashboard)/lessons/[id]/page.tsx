"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLesson, useUpdateLesson, useCreateProgress } from "@/hooks/useSchool";
import { useLearningStore } from "@/store/useLearningStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getAttachments, Attachment } from "@/lib/fileStorage";
import {
  BookOpen, Sparkles, Pin, Highlighter, FileText, CheckCircle, ArrowLeft,
  Volume2, Trash2, Edit2, Play, Pause, ChevronLeft, ChevronRight, PenTool,
  Bookmark, Award, Save, RefreshCw, MessageSquare, AlertCircle, Video, Image as ImageIcon,
  Settings, Maximize, ZoomOut, ZoomIn, Download, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = (params.id as string) || "";

  // Fetch lesson data
  const { data: lesson, isLoading, isError } = useLesson(lessonId);

  // Zustand State hooks
  const {
    completedLessons, annotations, completeLesson, viewLesson,
    updateNotes, toggleBookmark, addHighlight, removeHighlight, updateWhiteboard
  } = useLearningStore();
  const createProgress = useCreateProgress();
  const user = useAuthStore((state) => state.user);

  const isCompleted = completedLessons.includes(lessonId);
  const lessonAnnotation = annotations[lessonId] || { lessonId, notes: "", bookmarks: false, highlights: [] };

  // Local interaction states
  const [activeTab, setActiveTab] = useState("content");
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [noteInput, setNoteInput] = useState(lessonAnnotation.notes);
  const [highlightColor, setHighlightColor] = useState("#fbbf24"); // yellow default
  const [highlightText, setHighlightText] = useState("");
  const [comments, setComments] = useState<{ id: string; user: string; text: string; time: string }[]>([
    { id: "1", user: "Professor Higgins", text: "Remember to focus on the structure of the chloroplast membrane.", time: "1 hour ago" },
    { id: "2", user: "Sam (Parent)", text: "This visual diagram was very helpful for Tommy!", time: "30 mins ago" }
  ]);
  const [newComment, setNewComment] = useState("");
  const [viewingFile, setViewingFile] = useState<{ label: string; type: 'video' | 'pdf' | 'image'; file?: File } | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dataUrl, setDataUrl] = useState<string | undefined>(undefined);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (lessonId) {
      getAttachments(lessonId).then(setAttachments).catch(console.error);
    }
  }, [lessonId]);

  useEffect(() => {
    if (viewingFile?.file) {
      const url = URL.createObjectURL(viewingFile.file);
      setDataUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setDataUrl(undefined);
    }
  }, [viewingFile]);

  // Canvas Whiteboard Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (lessonId) {
      viewLesson(lessonId);
    }
  }, [lessonId]);

  useEffect(() => {
    // Sync note input with store if changed
    setNoteInput(lessonAnnotation.notes);
  }, [lessonAnnotation.notes]);

  // Whiteboard drawing functions
  useEffect(() => {
    if (activeTab === "whiteboard" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#0d9488"; // teal
        
        // Load saved drawing if exists
        if (lessonAnnotation.whiteboardData) {
          const img = new Image();
          img.src = lessonAnnotation.whiteboardData;
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
        }
      }
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveWhiteboardData();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveWhiteboardData();
    toast.success("Canvas cleared");
  };

  const saveWhiteboardData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    updateWhiteboard(lessonId, dataUrl);
  };

  // AI Summary generator
  const triggerAiSummary = () => {
    if (!lesson?.content) return;
    setIsAiSummarizing(true);
    setTimeout(() => {
      setAiSummary(
        `### AI Learning Summary\n` +
        `*   **Key Concept**: Structural composition and functional utility of ${lesson.title}.\n` +
        `*   **Crucial Focus**: Ensure you review how these cells interact with neighboring tissues.\n` +
        `*   **Action Plan**: Review the matching puzzle activity to reinforce vocabulary definitions.`
      );
      setIsAiSummarizing(false);
      toast.success("AI Summary generated");
    }, 1200);
  };

  // Lesson Completion Action
  const handleCompleteLesson = () => {
    completeLesson(lessonId);
    if (user?.id) {
      createProgress.mutate({
        student_id: user.id,
        lesson_id: lessonId,
        completion_percentage: 100,
        status: "completed"
      });
    }
    toast.success("Lesson completed! You earned 150 XP and 25 Coins! 🎉");
  };

  // Audio Synthesis
  const toggleAudio = () => {
    if (!lesson?.content) return;
    
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      // Strip markdown characters for cleaner reading
      const cleanText = lesson.content.replace(/[#*`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleAddHighlight = () => {
    if (!highlightText.trim()) return;
    addHighlight(lessonId, highlightText, highlightColor);
    setHighlightText("");
    toast.success("Highlight saved");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      { id: `c-${Date.now()}`, user: "You", text: newComment, time: "Just now" }
    ]);
    setNewComment("");
    toast.success("Comment added");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pt-12">
        <div className="h-6 w-1/4 bg-muted animate-pulse rounded" />
        <div className="h-10 w-2/3 bg-muted animate-pulse rounded" />
        <div className="h-64 w-full bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="max-w-md mx-auto text-center space-y-3 pt-24">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <p className="font-bold text-sm">Failed to load lesson</p>
        <Button onClick={() => router.back()} className="text-xs">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      
      {/* Immersive Gamified Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 border border-teal-800/30 p-8 sm:p-12 shadow-2xl mt-4">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-5 max-w-3xl">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-xs text-teal-100/70 hover:text-white hover:bg-white/10 -ml-4 mb-2 rounded-full backdrop-blur-md transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Curriculum
            </Button>
            <div className="flex items-center gap-3">
              <Badge className="bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border-teal-500/30 px-3 py-1 text-xs">Module {lesson.class_id.substring(0,4)}</Badge>
              <span className="text-xs text-teal-100/50 font-medium flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> +150 XP</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-heading text-white leading-tight">{lesson.title}</h1>
            <p className="text-base sm:text-lg text-teal-100/80 leading-relaxed font-serif max-w-2xl">{lesson.description || "Dive into this interactive educational unit and master new concepts at your own pace."}</p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" size="lg" className="h-12 px-6 gap-2 rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105" onClick={() => toggleBookmark(lessonId)}>
              <Bookmark className={`h-5 w-5 ${lessonAnnotation.bookmarks ? "fill-yellow-500 text-yellow-500" : ""}`} />
              {lessonAnnotation.bookmarks ? "Saved" : "Save"}
            </Button>
            <Button disabled={isCompleted} onClick={handleCompleteLesson}
              className={`h-12 px-8 gap-2 rounded-full font-bold shadow-lg shadow-teal-900/50 transition-all ${isCompleted ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-white text-teal-950 hover:bg-teal-50 hover:scale-105"}`}>
              {isCompleted ? <><Award className="h-5 w-5" /> Mastered</> : <><CheckCircle className="h-5 w-5" /> Complete</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid Tabs */}
      <div className="grid gap-12 md:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-border/40 p-0 rounded-none h-auto w-full justify-start gap-8 mb-8 flex-nowrap overflow-x-auto no-scrollbar">
              <TabsTrigger value="content" className="text-sm sm:text-base py-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold transition-all">Interactive Lesson</TabsTrigger>
              <TabsTrigger value="whiteboard" className="text-sm sm:text-base py-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold transition-all">Smart Whiteboard</TabsTrigger>
              <TabsTrigger value="highlights" className="text-sm sm:text-base py-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold transition-all">Study Notes ({lessonAnnotation.highlights.length})</TabsTrigger>
            </TabsList>

            {/* TAB: CONTENT */}
            <TabsContent value="content" className="mt-0 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="prose prose-teal max-w-none dark:prose-invert">
                {/* Audio Mini-player */}
                <div onClick={toggleAudio} className="float-right ml-8 mb-6 p-1.5 bg-teal-500/10 rounded-full border border-teal-500/20 flex items-center gap-3 transition-colors hover:bg-teal-500/20 w-fit cursor-pointer shadow-sm">
                  <div className="p-2 bg-teal-600 rounded-full text-white shadow-md">
                    {isPlayingAudio ? (
                      <Pause className="h-4 w-4 fill-white" />
                    ) : (
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    )}
                  </div>
                  <div className="pr-4">
                    <p className="text-xs font-bold text-teal-800 dark:text-teal-300 leading-tight">
                      {isPlayingAudio ? "Stop Narration" : "Listen to Lesson"}
                    </p>
                    <p className="text-[10px] text-teal-600/80 font-medium">Laura AI • 2m</p>
                  </div>
                </div>

                <div className="text-lg sm:text-xl leading-loose text-foreground/90 whitespace-pre-wrap font-serif first-letter:text-7xl first-letter:font-extrabold first-letter:text-teal-600 first-letter:mr-4 first-letter:float-left first-letter:leading-[0.8] clear-none">
                  {lesson.content || "Welcome to the Lesson. The core structures outlined here cover basic concepts and their functions in greater detail. Dive into the material below to unlock your next achievement."}
                </div>
              </div>

              {/* Learning Materials Section */}
              <div className="space-y-6 pt-8 border-t border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-500/10 rounded-xl"><FileText className="h-5 w-5 text-teal-600" /></div>
                  <h3 className="text-2xl font-bold font-heading">Course Materials</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {attachments.length > 0 ? attachments.map((file, i) => (
                    <div key={i} onClick={() => setViewingFile({ label: file.label, type: file.type, file: file.file })} className="group relative overflow-hidden flex flex-col items-center justify-center p-8 border border-border/50 rounded-3xl bg-gradient-to-b from-card to-muted/30 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                      <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {file.type === 'video' && <div className="p-4 bg-red-500/10 rounded-2xl mb-5 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"><Video className="h-8 w-8 text-red-500" /></div>}
                      {file.type === 'pdf' && <div className="p-4 bg-blue-500/10 rounded-2xl mb-5 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"><FileText className="h-8 w-8 text-blue-500" /></div>}
                      {file.type === 'image' && <div className="p-4 bg-emerald-500/10 rounded-2xl mb-5 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"><ImageIcon className="h-8 w-8 text-emerald-500" /></div>}
                      <span className="text-base font-bold text-center line-clamp-1 relative z-10 text-foreground/90">{file.label}</span>
                      <span className="text-xs text-muted-foreground mt-2 relative z-10 font-bold tracking-wider uppercase">{file.size}</span>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                    </div>
                  )) : (
                    <div className="col-span-full p-12 text-center border-2 border-dashed rounded-3xl text-muted-foreground text-base bg-muted/10 font-medium">
                      No learning materials have been attached to this lesson by the instructor yet.
                    </div>
                  )}
                </div>
              </div>

              {/* AI Summary Section */}
              <div className="pt-8">
                <div className="relative overflow-hidden border border-teal-500/30 rounded-3xl bg-gradient-to-br from-teal-500/10 via-teal-900/5 to-transparent shadow-lg shadow-teal-500/5 p-8">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-teal-500/20 rounded-2xl">
                        <Sparkles className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-heading">Laura AI Briefing</h4>
                        <p className="text-sm text-muted-foreground">Instantly synthesize your reading</p>
                      </div>
                    </div>
                    <Button size="lg" className="h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 px-8 font-bold w-full sm:w-auto" onClick={triggerAiSummary} disabled={isAiSummarizing}>
                      {isAiSummarizing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : "Generate Summary"}
                    </Button>
                  </div>
                  
                  {aiSummary ? (
                    <div className="relative z-10 p-6 bg-background/80 backdrop-blur-sm border border-white/10 rounded-2xl shadow-inner mt-4 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-base leading-loose font-medium text-foreground/90 whitespace-pre-wrap font-sans">{aiSummary}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </TabsContent>

            {/* TAB: WHITEBOARD */}
            <TabsContent value="whiteboard" className="mt-4 space-y-4">
              <Card className="border-border/60">
                <CardHeader className="pb-3 border-b flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-xs font-bold flex items-center gap-1"><PenTool className="h-4 w-4" /> Tactical whiteboard</CardTitle>
                    <CardDescription className="text-[10px] mt-0.5">Use your mouse or screen to sketch equations and notes.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl" onClick={clearCanvas}>Clear Canvas</Button>
                </CardHeader>
                <CardContent className="p-4 flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={300}
                    className="border border-border/80 rounded-2xl bg-card cursor-crosshair max-w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: HIGHLIGHTS */}
            <TabsContent value="highlights" className="mt-4 space-y-4">
              <Card className="border-border/60">
                <CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-bold flex items-center gap-1"><Highlighter className="h-4 w-4" /> Save Highlights</CardTitle></CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Paste important text here..." value={highlightText} onChange={(e: ChangeEvent<HTMLInputElement>) => setHighlightText(e.target.value)} className="text-xs h-9" />
                    <div className="flex items-center gap-1 shrink-0">
                      {["#fbbf24", "#60a5fa", "#34d399", "#f87171"].map(color => (
                        <div key={color} className={`w-6 h-6 rounded-full cursor-pointer border ${highlightColor === color ? "border-foreground" : "border-transparent"}`}
                          style={{ backgroundColor: color }} onClick={() => setHighlightColor(color)} />
                      ))}
                    </div>
                    <Button onClick={handleAddHighlight} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 text-xs">Highlight</Button>
                  </div>

                  <div className="space-y-2">
                    {lessonAnnotation.highlights.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-4">No highlights created.</p>
                    ) : (
                      lessonAnnotation.highlights.map(hl => (
                        <div key={hl.id} className="flex justify-between items-center p-3 rounded-2xl border text-xs bg-muted/20" style={{ borderLeftColor: hl.color, borderLeftWidth: "4px" }}>
                          <p className="flex-1 pr-4 italic">"{hl.text}"</p>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeHighlight(lessonId, hl.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Comments Section */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-bold flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> Lesson Discussion Comments</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input placeholder="Ask a question or discuss this lesson..." value={newComment} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)} className="text-xs h-9" />
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 text-xs">Comment</Button>
              </form>

              <div className="space-y-3 pt-2">
                {comments.map(c => (
                  <div key={c.id} className="p-3 bg-muted/20 rounded-2xl border space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                      <span>{c.user}</span>
                      <span>{c.time}</span>
                    </div>
                    <p className="text-card-foreground/90">{c.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Notes */}
        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-bold flex items-center gap-1"><FileText className="h-4 w-4" /> Notepad</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              <Textarea
                placeholder="Draft study logs and answers..."
                value={noteInput}
                onChange={e => {
                  setNoteInput(e.target.value);
                  updateNotes(lessonId, e.target.value);
                }}
                className="min-h-[220px] text-xs"
              />
              <p className="text-[9px] text-muted-foreground italic">Notes are autosaved to your learning store.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* File Viewer Modal */}
      <Dialog open={!!viewingFile} onOpenChange={(open) => !open && setViewingFile(null)}>
        <DialogContent className="sm:max-w-5xl w-[95vw] h-[85vh] flex flex-col p-0 overflow-hidden bg-background border-border/60 shadow-2xl">
          <DialogHeader className="p-4 border-b bg-muted/40 shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold flex items-center gap-2.5">
              {viewingFile?.type === 'video' && <Video className="h-4 w-4 text-red-500" />}
              {viewingFile?.type === 'pdf' && <FileText className="h-4 w-4 text-blue-500" />}
              {viewingFile?.type === 'image' && <ImageIcon className="h-4 w-4 text-emerald-500" />}
              {viewingFile?.label}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-[10px] hidden sm:flex gap-1.5"><Save className="h-3.5 w-3.5" /> Save to Drive</Button>
            </div>
            <DialogDescription className="sr-only">Viewing learning material</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 bg-muted/10 flex items-center justify-center relative overflow-hidden">
            
            {/* REALISTIC VIDEO PLAYER */}
            {viewingFile?.type === 'video' && (
              <div className="w-full h-full flex flex-col relative bg-black">
                <video 
                  src={dataUrl || "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} 
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              </div>
            )}
            
            {/* REALISTIC PDF VIEWER */}
            {viewingFile?.type === 'pdf' && (
              <div className="w-full h-full flex flex-col bg-[#525659] dark:bg-zinc-900">
                {/* PDF Toolbar */}
                <div className="h-12 bg-[#323639] dark:bg-zinc-950 border-b border-white/10 flex items-center justify-between px-4 shrink-0 shadow-md z-10">
                  <div className="flex items-center gap-2 text-white/80">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-xs">1 / 1</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white/80"><ZoomOut className="h-4 w-4" /></Button>
                    <span className="text-xs text-white/80 w-12 text-center">100%</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white/80"><ZoomIn className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white/80"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
                {/* PDF Pages */}
                <div className="flex-1 overflow-hidden bg-[#525659]">
                  {dataUrl ? (
                    <iframe src={dataUrl} className="w-full h-full border-none" />
                  ) : (
                    <div className="w-full h-full overflow-y-auto p-8 flex flex-col gap-8 items-center pdf-scroll-area">
                      <div className="w-full max-w-[800px] min-h-[1131px] bg-white text-black shadow-xl rounded-sm flex flex-col p-12 shrink-0">
                        <div className="w-full flex justify-between border-b pb-4 mb-6 border-gray-300">
                          <div className="font-bold text-lg">{lesson?.title || 'Study Guide'}</div>
                          <div className="text-sm text-gray-500">Official Material</div>
                        </div>
                        <div className="text-2xl font-bold mb-8">Lesson Overview & Study Notes</div>
                        <div className="space-y-4 flex-1 text-sm leading-relaxed whitespace-pre-wrap font-serif">
                          {lesson?.content || "This document contains the primary study material for this lesson."}
                        </div>
                        <div className="w-full flex justify-center pt-8 border-t border-gray-300 mt-12">
                          <div className="text-xs text-gray-400">Page 1</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* REALISTIC IMAGE VIEWER */}
            {viewingFile?.type === 'image' && (
              <div className="w-full h-full flex flex-col bg-black/95 relative">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md"><ZoomIn className="h-4 w-4" /></Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md"><ZoomOut className="h-4 w-4" /></Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md"><Download className="h-4 w-4" /></Button>
                </div>
                <div className="w-full h-full p-8 flex items-center justify-center">
                  <div className="relative max-w-full max-h-full rounded-md overflow-hidden shadow-2xl border border-white/10">
                    <img 
                      src={dataUrl || "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200"} 
                      alt="Educational Diagram"
                      className="max-w-full max-h-[75vh] object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
