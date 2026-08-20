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
  Settings, Maximize, ZoomOut, ZoomIn, Download, Loader2, Scan, Hand
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
  const [viewingFile, setViewingFile] = useState<{ label: string; type: 'video' | 'pdf' | 'image' | 'youtube'; file?: File; url?: string } | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dataUrl, setDataUrl] = useState<string | undefined>(undefined);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Kinesthetic State (Real AR Motion Detection)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  
  // AR State
  const [arCursor, setArCursor] = useState({ x: 50, y: 50 });
  const [arPickedItem, setArPickedItem] = useState<number | null>(null);
  const [arPlacedItems, setArPlacedItems] = useState({ 0: false, 1: false, 2: false });
  const [arExplosion, setArExplosion] = useState(false);

  // --- TACTILE INSTRUMENT STATE ---
  const [instrumentValues, setInstrumentValues] = useState<Record<string, number | boolean>>({});
  const [tactileSuccess, setTactileSuccess] = useState(false);

  // Dynamic Tactile Instrument Theme
  const getInstrumentTheme = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("solar") || t.includes("planet") || t.includes("space")) {
      return {
        title: "Orbital Mechanics Console",
        bgClass: "bg-slate-900",
        controls: [
          { id: "grav", type: "slider", label: "GRAVITY TUNER", min: 0, max: 20, target: 9.8, step: 0.1, unit: "m/s²" },
          { id: "thruster", type: "switch", label: "MAIN THRUSTER", target: true },
          { id: "vel", type: "slider", label: "ORBITAL VELOCITY", min: 0, max: 100, target: 75, step: 1, unit: "km/s" }
        ],
        successText: "ORBIT STABILIZED"
      };
    }
    if (t.includes("cell") || t.includes("biol") || t.includes("plant") || t.includes("animal")) {
      return {
        title: "Microscope Control Panel",
        bgClass: "bg-emerald-950",
        controls: [
          { id: "zoom", type: "slider", label: "MAGNIFICATION", min: 100, max: 1000, target: 400, step: 50, unit: "x" },
          { id: "light", type: "switch", label: "UV ILLUMINATOR", target: true },
          { id: "focus", type: "slider", label: "FINE FOCUS", min: 0, max: 10, target: 7.5, step: 0.5, unit: "mm" }
        ],
        successText: "SPECIMEN RESOLVED"
      };
    }
    return {
      title: "Diagnostic Dashboard",
      bgClass: "bg-slate-950",
      controls: [
        { id: "volt", type: "slider", label: "INPUT VOLTAGE", min: 0, max: 12, target: 5, step: 0.5, unit: "V" },
        { id: "pwr", type: "switch", label: "SYSTEM POWER", target: true },
        { id: "freq", type: "slider", label: "FREQUENCY", min: 0, max: 100, target: 60, step: 5, unit: "Hz" }
      ],
      successText: "SYSTEM CALIBRATED"
    };
  };

  const checkInstrumentSuccess = (newValues: Record<string, number | boolean>, theme: any) => {
    let success = true;
    for (const ctrl of theme.controls) {
      const val = newValues[ctrl.id];
      if (val === undefined) { success = false; break; }
      if (ctrl.type === "slider") {
        if (Math.abs((val as number) - ctrl.target) > 0.01) { success = false; break; }
      } else {
        if (val !== ctrl.target) { success = false; break; }
      }
    }
    
    if (success && !tactileSuccess) {
      setTactileSuccess(true);
      setTimeout(() => setTactileSuccess(false), 3000);
    }
  };

  const handleInstrumentChange = (id: string, value: number | boolean, theme: any) => {
    const newValues = { ...instrumentValues, [id]: value };
    setInstrumentValues(newValues);
    checkInstrumentSuccess(newValues, theme);
  };
  useEffect(() => {
    let animationFrameId: number;
    let previousImageData: ImageData | null = null;
    
    const detectMotion = () => {
      const video = videoRef.current;
      const canvas = hiddenCanvasRef.current;
      if (!video || !canvas || video.paused || video.ended) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      if (previousImageData) {
        const motionPixels: {x: number, y: number}[] = [];

        // FRAME DROP FIX: Process pixels by stepping 8 (4x faster CPU performance)
        for (let y = 0; y < canvas.height; y += 8) {
          for (let x = 0; x < canvas.width; x += 8) {
            const i = (y * canvas.width + x) * 4;
            const rDiff = Math.abs(currentImageData.data[i] - previousImageData.data[i]);
            const gDiff = Math.abs(currentImageData.data[i+1] - previousImageData.data[i+1]);
            const bDiff = Math.abs(currentImageData.data[i+2] - previousImageData.data[i+2]);
            
            // Very high threshold to ignore subtle skin tone shadows and face movements
            if (rDiff + gDiff + bDiff > 150) {
              motionPixels.push({x, y});
            }
          }
        }
        
        // FACE IGNORE LOGIC: Find the *highest* moving object (the raised hand)
        if (motionPixels.length > 2) {
          // Sort ascending by Y (top of screen = 0)
          motionPixels.sort((a, b) => a.y - b.y);
          
          // Take the top 8 pixels to form a stable center point for the hand (ignoring the face below it)
          const handPixels = motionPixels.slice(0, 8);
          const avgX = handPixels.reduce((sum, p) => sum + p.x, 0) / handPixels.length;
          const avgY = handPixels.reduce((sum, p) => sum + p.y, 0) / handPixels.length;
          
          // Invert X because the video is mirrored
          const rawX = (avgX / canvas.width) * 100;
          const mappedX = 100 - rawX; 
          const mappedY = (avgY / canvas.height) * 100;
          
          setArCursor(prev => {
            const dx = mappedX - prev.x;
            const dy = mappedY - prev.y;
            // Deadzone to stop micro-jitters
            if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return prev;
            return {
              // Responsive but smooth lerp (0.35) so it doesn't drag/drop slowly!
              x: prev.x + dx * 0.35,
              y: prev.y + dy * 0.35
            };
          });
        }
      }
      
      previousImageData = currentImageData;
      animationFrameId = requestAnimationFrame(detectMotion);
    };

    if (isWebcamActive) {
      setTimeout(() => { detectMotion(); }, 500);
    }
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isWebcamActive]);

  // AR Collision and Logic Engine
  useEffect(() => {
    if (!isWebcamActive || arExplosion) return;

    const cx = arCursor.x;
    const cy = arCursor.y;

    // Shifted X coordinates leftward (20, 45, 70) so they don't hide under the right panel
    const spawns = [ { id: 0, x: 20, y: 80 }, { id: 1, x: 45, y: 80 }, { id: 2, x: 70, y: 80 } ];
    const targets = [ { id: 0, x: 20, y: 20 }, { id: 1, x: 45, y: 20 }, { id: 2, x: 70, y: 20 } ];
    // Reduced threshold to 6% (requires exact precision, prevents auto-grabbing)
    const threshold = 6;

    if (arPickedItem === null) {
      for (const spawn of spawns) {
        if (!arPlacedItems[spawn.id as keyof typeof arPlacedItems]) {
          const dist = Math.sqrt(Math.pow(cx - spawn.x, 2) + Math.pow(cy - spawn.y, 2));
          if (dist < threshold) {
            setArPickedItem(spawn.id);
            break;
          }
        }
      }
    } else {
      const target = targets.find(t => t.id === arPickedItem);
      if (target) {
        const dist = Math.sqrt(Math.pow(cx - target.x, 2) + Math.pow(cy - target.y, 2));
        if (dist < threshold) {
          setArPlacedItems(prev => {
            const next = { ...prev, [arPickedItem]: true };
            if (next[0] && next[1] && next[2]) {
              setArExplosion(true);
            }
            return next;
          });
          setArPickedItem(null);
        }
      }
    }
  }, [arCursor, arPickedItem, arPlacedItems, isWebcamActive, arExplosion]);

  const toggleWebcam = async () => {
    if (isWebcamActive) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsWebcamActive(false);
      setArPickedItem(null);
      setArPlacedItems({ 0: false, 1: false, 2: false });
      setArExplosion(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsWebcamActive(true);
      } catch (err) {
        toast.error("Webcam access denied.");
      }
    }
  };

  // Tactile State
  const [circuit, setCircuit] = useState({ item0: false, item1: false, item2: false });
  const isCircuitComplete = circuit.item0 && circuit.item1 && circuit.item2;

  // Dynamic Tactile Theme based on Lesson Title
  const getTactileTheme = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("solar") || t.includes("planet") || t.includes("space")) {
      return {
        title: "Assemble the Solar System",
        items: [{ id: "sun", label: "SUN", color: "amber" }, { id: "earth", label: "EARTH", color: "blue" }, { id: "moon", label: "MOON", color: "slate" }],
        success: "Orbit Established!",
        layout: 'orbit',
        bgClass: "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-black",
        instructions: [
          "1. Ignite the core: Pick up the Sun and place it in the center.",
          "2. Set the habitable zone: Move the Earth to the middle orbit.",
          "3. Create tidal forces: Place the Moon on the outer orbit."
        ]
      };
    }
    if (t.includes("cell") || t.includes("biol") || t.includes("plant") || t.includes("animal")) {
      return {
        title: "Build the Cell",
        items: [{ id: "nucleus", label: "NUCLEUS", color: "purple" }, { id: "mito", label: "MITOCHONDRIA", color: "red" }, { id: "membrane", label: "MEMBRANE", color: "emerald" }],
        success: "Cell Synthesized!",
        layout: 'cell',
        bgClass: "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950 via-teal-950 to-black",
        instructions: [
          "1. Establish control: Place the Nucleus in the center.",
          "2. Generate power: Move the Mitochondria inside the cell.",
          "3. Protect the cell: Wrap the Membrane around the outside."
        ]
      };
    }
    if (t.includes("math") || t.includes("algebra") || t.includes("fraction")) {
      return {
        title: "Solve the Equation",
        items: [{ id: "var", label: "VARIABLE X", color: "blue" }, { id: "op", label: "OPERATOR", color: "amber" }, { id: "sol", label: "SOLUTION", color: "emerald" }],
        success: "Equation Balanced!",
        layout: 'linear',
        bgClass: "bg-slate-950 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px]",
        instructions: [
          "1. Define the unknown: Place Variable X on the left.",
          "2. Apply logic: Place the Operator in the middle.",
          "3. Find the answer: Place the Solution on the right."
        ]
      };
    }
    if (t.includes("chem") || t.includes("water") || t.includes("atom")) {
      return {
        title: "Form the Molecule",
        items: [{ id: "h1", label: "HYDROGEN", color: "blue" }, { id: "h2", label: "HYDROGEN", color: "blue" }, { id: "o1", label: "OXYGEN", color: "red" }],
        success: "Molecule Stable!",
        layout: 'linear',
        bgClass: "bg-slate-950 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px]",
        instructions: [
          "1. Place the first Hydrogen atom.",
          "2. Place the second Hydrogen atom.",
          "3. Bond them with the central Oxygen atom."
        ]
      };
    }
    if (t.includes("code") || t.includes("program") || t.includes("computer")) {
      return {
        title: "Compile the Program",
        items: [{ id: "input", label: "INPUT DATA", color: "slate" }, { id: "logic", label: "LOGIC GATE", color: "purple" }, { id: "output", label: "OUTPUT", color: "emerald" }],
        success: "Program Executed!",
        layout: 'linear',
        bgClass: "bg-slate-950 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px]",
        instructions: [
          "1. Feed the system: Place the Input Data.",
          "2. Process it: Place the Logic Gate in the center.",
          "3. Yield results: Place the Output at the end."
        ]
      };
    }
    return {
      title: "Assemble the Circuit",
      items: [{ id: "battery", label: "9V BATTERY", color: "red" }, { id: "resistor", label: "RESISTOR", color: "amber" }, { id: "led", label: "LED DIODE", color: "blue" }],
      success: "Circuit Operational!",
      layout: 'linear',
      bgClass: "bg-slate-950 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px]",
      instructions: [
        "1. Power source: Place the 9V Battery to start the flow.",
        "2. Control current: Place the Resistor in the middle.",
        "3. See the result: Place the LED to complete the circuit."
      ]
    };
  };

  const getColorClasses = (color: string) => {
    if (color === 'red') return 'bg-red-950/80 border-red-500/50 text-red-100 shadow-red-500/10';
    if (color === 'blue') return 'bg-blue-950/80 border-blue-500/50 text-blue-100 shadow-blue-500/10';
    if (color === 'amber') return 'bg-amber-950/80 border-amber-500/50 text-amber-100 shadow-amber-500/10';
    if (color === 'emerald') return 'bg-emerald-950/80 border-emerald-500/50 text-emerald-100 shadow-emerald-500/10';
    if (color === 'purple') return 'bg-purple-950/80 border-purple-500/50 text-purple-100 shadow-purple-500/10';
    return 'bg-slate-900/80 border-slate-500/50 text-slate-100 shadow-slate-500/10';
  };

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
              <TabsTrigger value="tactile" className="text-sm sm:text-base py-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold transition-all">Tactile Sandbox</TabsTrigger>
              <TabsTrigger value="kinesthetic" className="text-sm sm:text-base py-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold transition-all">Kinesthetic Arena</TabsTrigger>
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
                    <div key={i} onClick={() => setViewingFile({ label: file.label, type: file.type, file: file.file, url: file.url })} className="group relative overflow-hidden flex flex-col items-center justify-center p-8 border border-border/50 rounded-3xl bg-gradient-to-b from-card to-muted/30 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                      <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {file.type === 'video' && <div className="p-4 bg-red-500/10 rounded-2xl mb-5 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"><Video className="h-8 w-8 text-red-500" /></div>}
                      {file.type === 'pdf' && <div className="p-4 bg-blue-500/10 rounded-2xl mb-5 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"><FileText className="h-8 w-8 text-blue-500" /></div>}
                      {file.type === 'image' && <div className="p-4 bg-emerald-500/10 rounded-2xl mb-5 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"><ImageIcon className="h-8 w-8 text-emerald-500" /></div>}
                      {file.type === 'youtube' && <div className="p-4 bg-red-600/10 rounded-2xl mb-5 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"><Video className="h-8 w-8 text-red-600" /></div>}
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

            {/* TAB: TACTILE SANDBOX (HEAVY INSTRUMENT PANEL) */}
            <TabsContent value="tactile" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {(() => {
                const iTheme = getInstrumentTheme(lesson?.title || "");
                return (
                  <div className={`relative w-full min-h-[550px] border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-8 flex flex-col ${iTheme.bgClass}`}>
                    
                    {/* Metal Panel Background Texture */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000040_2px,transparent_2px),linear-gradient(to_bottom,#00000040_2px,transparent_2px)] bg-[size:100px_100px] opacity-20 pointer-events-none mix-blend-overlay"></div>
                    
                    {/* Header */}
                    <div className="relative z-10 border-b-2 border-white/10 pb-6 mb-8 flex justify-between items-end">
                      <div>
                        <h2 className="text-3xl font-black text-white/90 font-heading tracking-wider uppercase drop-shadow-md">{iTheme.title}</h2>
                        <p className="text-teal-400 font-mono text-sm mt-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                          CALIBRATE ALL SYSTEMS TO REQUIRED PARAMETERS
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white/40 font-mono text-xs">
                        SYS_ID: {lessonId.substring(0,8).toUpperCase()}
                      </div>
                    </div>

                    {/* Controls Grid */}
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                      {iTheme.controls.map(ctrl => {
                        // Ensure a default value is present for the UI before user interaction
                        const val: number | boolean = instrumentValues[ctrl.id] ?? (ctrl.type === 'slider' ? (ctrl.min || 0) : false);
                        
                        const isMatched = ctrl.type === 'slider' 
                          ? Math.abs((val as number) - (ctrl.target as number)) <= 0.01 
                          : val === ctrl.target;
                          
                        return (
                          <div key={ctrl.id} className="bg-black/40 border-2 border-white/5 rounded-2xl p-6 flex flex-col items-center justify-between shadow-xl backdrop-blur-sm relative overflow-hidden group">
                            
                            {/* Status Indicator */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                              <span className={`text-[10px] font-bold font-mono ${isMatched ? 'text-emerald-400' : 'text-slate-500'}`}>{isMatched ? 'LOCKED' : 'UNSTABLE'}</span>
                              <div className={`w-2 h-2 rounded-full ${isMatched ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-700'}`}></div>
                            </div>

                            <div className="text-center w-full mb-8 mt-2">
                              <h4 className="text-slate-300 font-bold tracking-widest text-sm uppercase">{ctrl.label}</h4>
                              <p className="text-slate-500 font-mono text-[10px] mt-1">TARGET: {ctrl.target} {ctrl.unit || ''}</p>
                            </div>

                            {/* Slider Control */}
                            {ctrl.type === 'slider' && (
                              <div className="flex flex-col items-center w-full gap-6">
                                <div className="text-4xl font-light font-mono text-white/90 bg-black/60 px-6 py-3 rounded-xl border border-white/10 shadow-inner w-full text-center">
                                  {Number(val).toFixed((ctrl.step || 1) % 1 === 0 ? 0 : 1)} <span className="text-lg text-slate-500">{ctrl.unit}</span>
                                </div>
                                <input 
                                  type="range" 
                                  min={ctrl.min || 0} max={ctrl.max || 100} step={ctrl.step || 1} 
                                  value={val as number}
                                  onChange={(e) => handleInstrumentChange(ctrl.id, parseFloat(e.target.value), iTheme)}
                                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer outline-none border border-slate-700 shadow-inner accent-teal-500 transition-all hover:accent-teal-400"
                                />
                                <div className="w-full flex justify-between text-slate-600 font-mono text-[10px] font-bold px-1">
                                  <span>{ctrl.min}</span>
                                  <span>{ctrl.max}</span>
                                </div>
                              </div>
                            )}

                            {/* Switch Control */}
                            {ctrl.type === 'switch' && (
                              <div className="flex flex-col items-center flex-1 justify-center">
                                <div 
                                  onClick={() => handleInstrumentChange(ctrl.id, !val, iTheme)}
                                  className={`relative w-24 h-32 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-4 ${val ? 'bg-slate-800 border-teal-900' : 'bg-slate-900 border-slate-800'}`}
                                >
                                  {/* The physical switch toggle */}
                                  <div className={`absolute w-16 h-14 rounded shadow-2xl transition-all duration-300 border-y-4 ${val ? 'bg-teal-500 top-4 border-teal-400 shadow-[0_10px_20px_rgba(20,184,166,0.4)]' : 'bg-slate-700 bottom-4 border-slate-600'}`}>
                                    <div className="w-full h-1/2 border-b border-black/20"></div>
                                  </div>
                                </div>
                                <div className="mt-6 font-mono text-xl font-bold flex gap-4">
                                  <span className={!val ? 'text-white' : 'text-slate-600'}>OFF</span>
                                  <span className={val ? 'text-teal-400 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]' : 'text-slate-600'}>ON</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Excellence Blast Overlay */}
                    {tactileSuccess && (
                      <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                        <div className="text-center space-y-4">
                          <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 animate-[pulse_1s_infinite] drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] font-heading uppercase tracking-widest scale-150">
                            EXCELLENCE!
                          </h2>
                          <p className="mt-8 text-xl font-bold text-white tracking-widest uppercase bg-teal-900/80 px-8 py-3 rounded-full border border-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.5)]">
                            {iTheme.successText}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            {/* TAB: KINESTHETIC ARENA */}
            <TabsContent value="kinesthetic" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`p-8 border border-border/60 rounded-3xl bg-black overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${isWebcamActive ? '!fixed !inset-0 !z-[9999] !w-[100vw] !h-[100vh] !rounded-none !border-none !m-0 !p-0 !max-w-none' : ''}`}>
                
                {/* Major Screen Background (Virtual Environment) */}
                <div className={`w-full h-full absolute inset-0 transition-opacity duration-500 ${isWebcamActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'} ${(() => getTactileTheme(lesson?.title || "").bgClass)()}`}>
                  
                  {/* The PIP Camera Feed (Google Meet Style) */}
                  <div className="absolute bottom-8 left-8 w-64 h-48 bg-black rounded-3xl border-2 border-white/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded-md text-[10px] text-teal-400 font-mono flex items-center gap-2 border border-white/10 backdrop-blur-md">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      SENSOR FEED
                    </div>
                  </div>
                  <canvas ref={hiddenCanvasRef} width={160} height={120} className="hidden" />
                  
                  {/* AR OVERLAY AND GAME LOGIC */}
                  {(() => {
                    const theme = getTactileTheme(lesson?.title || "");
                    const spawns = [ { id: 0, x: 20, y: 80 }, { id: 1, x: 45, y: 80 }, { id: 2, x: 70, y: 80 } ];
                    const targets = [ { id: 0, x: 20, y: 20 }, { id: 1, x: 45, y: 20 }, { id: 2, x: 70, y: 20 } ];

                    return (
                      <div className="absolute inset-0 z-10 pointer-events-none">
                        
                        {/* Status Bar */}
                        <div className="absolute top-4 left-4 bg-black/60 px-4 py-2 rounded-xl border border-teal-500/30 text-teal-400 font-mono text-xs font-bold tracking-widest flex items-center gap-3 backdrop-blur-md">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          AR TRACKING ENGAGED
                        </div>

                        {/* Success Explosion */}
                        {arExplosion && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500 pointer-events-auto">
                            <h2 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 animate-[pulse_1s_infinite] drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] font-heading uppercase tracking-widest scale-150">
                              EXCELLENCE!
                            </h2>
                            <p className="mt-8 text-xl font-bold text-white tracking-widest uppercase bg-teal-900/50 px-6 py-2 rounded-full border border-teal-500 mb-12">{theme.success}</p>
                            
                            <Button 
                              onClick={toggleWebcam} 
                              className="relative z-50 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg px-12 py-6 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-300 pointer-events-auto"
                            >
                              COMPLETE & EXIT AR
                            </Button>
                            
                            <div className="absolute w-full h-full pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-400/30 via-transparent to-transparent opacity-50 animate-[ping_2s_infinite] -z-10"></div>
                          </div>
                        )}

                        {/* Target Zones */}
                        {!arExplosion && targets.map(target => {
                          const isPlaced = arPlacedItems[target.id as keyof typeof arPlacedItems];
                          return (
                            <div 
                              key={`target-${target.id}`}
                              className={`absolute w-32 h-32 rounded-3xl border-4 border-dashed flex flex-col items-center justify-center transition-all duration-500 ${isPlaced ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-110' : 'border-white/40 bg-black/20'}`}
                              style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
                            >
                              {isPlaced ? (
                                <>
                                  <Sparkles className="w-8 h-8 text-emerald-400 mb-2 animate-pulse" />
                                  <span className="text-[12px] font-bold text-emerald-100">{theme.items[target.id].label}</span>
                                </>
                              ) : (
                                <span className="text-[12px] font-bold text-white/50 text-center leading-tight">TARGET<br/>{theme.items[target.id].label}</span>
                              )}
                            </div>
                          );
                        })}

                        {/* Spawn Zones */}
                        {!arExplosion && spawns.map(spawn => {
                          const isPlaced = arPlacedItems[spawn.id as keyof typeof arPlacedItems];
                          const isPicked = arPickedItem === spawn.id;
                          if (isPlaced || isPicked) return null;
                          return (
                            <div 
                              key={`spawn-${spawn.id}`}
                              className={`absolute w-28 h-28 rounded-2xl flex flex-col items-center justify-center shadow-2xl bg-black/80 border border-white/20`}
                              style={{ left: `${spawn.x}%`, top: `${spawn.y}%`, transform: 'translate(-50%, -50%)' }}
                            >
                              <div className={`w-16 h-16 rounded-full mb-2 flex items-center justify-center shadow-lg ${getColorClasses(theme.items[spawn.id].color)}`}>
                                <span className="text-[10px] font-bold text-center px-1 leading-none">{theme.items[spawn.id].label}</span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Picked Item Attached to Cursor */}
                        {!arExplosion && arPickedItem !== null && (
                          <div 
                            className="absolute w-28 h-28 rounded-2xl flex flex-col items-center justify-center pointer-events-none transition-all duration-75"
                            style={{ left: `${arCursor.x}%`, top: `${arCursor.y}%`, transform: 'translate(-50%, -50%)' }}
                          >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] border-4 border-white animate-[pulse_1s_infinite] ${getColorClasses(theme.items[arPickedItem].color)}`}>
                              <span className="text-[12px] font-bold text-center px-1 leading-none">{theme.items[arPickedItem].label}</span>
                            </div>
                          </div>
                        )}

                        {/* AR Cursor (The Virtual Hand) */}
                        {!arExplosion && (
                          <div 
                            className="absolute w-24 h-24 pointer-events-none transition-all duration-75 ease-out z-40"
                            style={{ left: `${arCursor.x}%`, top: `${arCursor.y}%`, transform: 'translate(-50%, -50%)' }}
                          >
                            <Hand className={`w-16 h-16 transition-colors duration-300 drop-shadow-[0_0_20px_rgba(45,212,191,0.8)] ${arPickedItem !== null ? 'text-amber-400 scale-90' : 'text-teal-400'}`} />
                            {arPickedItem === null && <span className="absolute -bottom-2 left-4 whitespace-nowrap text-[10px] font-bold text-teal-300 drop-shadow-md bg-black/50 px-2 py-1 rounded">VIRTUAL HAND</span>}
                          </div>
                        )}

                      </div>
                    );
                  })()}
                  
                  <div className="absolute top-6 right-6 bg-black/60 px-3 py-1.5 rounded-md border border-teal-500/30 text-teal-400 font-mono text-xs font-bold tracking-widest pointer-events-auto">
                      <Button onClick={toggleWebcam} variant="ghost" className="h-6 hover:bg-red-500/20 hover:text-red-400 text-xs text-white p-2">
                        Exit AR
                      </Button>
                    </div>

                    {/* AI Mission Instructions Panel */}
                    <div className="absolute right-4 top-20 w-72 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <Sparkles className="w-5 h-5 text-teal-400" />
                        <h4 className="text-white font-bold font-heading">AI Mission Briefing</h4>
                      </div>
                      <div className="space-y-4">
                        {(() => {
                           const theme = getTactileTheme(lesson?.title || "");
                           return theme.instructions.map((step, idx) => {
                             const isCompleted = arPlacedItems[idx as keyof typeof arPlacedItems];
                             return (
                               <div key={idx} className={`flex gap-3 text-sm transition-opacity duration-300 ${isCompleted ? 'opacity-40 line-through text-teal-200' : 'text-slate-200'}`}>
                                 <div className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 border flex items-center justify-center ${isCompleted ? 'bg-teal-500 border-teal-500' : 'border-slate-500'}`}>
                                   {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                                 </div>
                                 <p className="leading-snug">{step}</p>
                               </div>
                             );
                           });
                        })()}
                      </div>
                    </div>
                </div>

                {!isWebcamActive && (
                  <div className="text-center space-y-6 z-10 p-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="mx-auto w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center border-2 border-teal-500/50 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
                      <Scan className="w-10 h-10 text-teal-400 animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-heading text-white mb-2">Kinesthetic AR Mode</h3>
                      <p className="text-sm text-slate-300">Your camera will become an interactive workspace. Move your hand to pick up components and place them into the correct targets.</p>
                    </div>
                    <Button onClick={toggleWebcam} className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white rounded-full h-12 px-8 w-full font-bold shadow-lg shadow-teal-900/50 text-base">
                      Start AR Simulation
                    </Button>
                  </div>
                )}
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
              {viewingFile?.type === 'youtube' && <Video className="h-4 w-4 text-red-600" />}
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
            
            {/* REALISTIC YOUTUBE VIEWER */}
            {viewingFile?.type === 'youtube' && viewingFile.url && (
              <div className="w-full h-full flex flex-col relative bg-black">
                <iframe 
                  src={viewingFile.url} 
                  className="w-full h-full border-none"
                  allowFullScreen
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
