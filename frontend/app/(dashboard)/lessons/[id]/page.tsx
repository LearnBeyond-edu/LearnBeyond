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
  const lessonSeed = lessonId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 42;

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
    { id: "1", user: "Professor Higgins", text: "Remember to explore all the interactive simulation tools in this lesson!", time: "1 hour ago" },
    { id: "2", user: "Sam (Parent)", text: "The AR tools were incredibly helpful for understanding this topic.", time: "30 mins ago" }
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
  const [instrumentValues, setInstrumentValues] = useState<Record<string, any>>({});
  const [tactileSuccess, setTactileSuccess] = useState(false);
  
  // Teardown state
  const [teardownStage, setTeardownStage] = useState(0);
  const [screwsState, setScrewsState] = useState<Record<string, number>>({});
  const [activeScrew, setActiveScrew] = useState<string | null>(null);
  const [layerOffset, setLayerOffset] = useState({ x: 0, y: 0 });
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Dynamic Tactile Instrument Theme
  const getInstrumentTheme = (lesson: any) => {
    const title = lesson?.title || "";
    const content = lesson?.content || "";
    const t = title.toLowerCase();
    
    if (t.includes("solar") || t.includes("planet") || t.includes("space")) {
      return {
        mode: 'orbital',
        title: "Orbital Mechanics Console",
        bgClass: "bg-slate-900",
        controls: [
          { id: "grav", type: "slider", target: 9.8, min: 0, max: 20 },
          { id: "vel", type: "slider", target: 75, min: 0, max: 100 },
          { id: "thruster", type: "switch", target: true }
        ],
        successText: "ORBIT STABILIZED"
      };
    }
    if (t.includes("cell") || t.includes("biol") || t.includes("plant") || t.includes("animal")) {
      return {
        mode: 'microscope',
        title: "Microscope Control Panel",
        bgClass: "bg-emerald-950",
        controls: [
          { id: "focus", type: "slider", target: 400, min: 100, max: 1000 },
          { id: "panX", type: "slider", target: 50, min: 0, max: 100 },
          { id: "panY", type: "slider", target: 50, min: 0, max: 100 }
        ],
        successText: "SPECIMEN RESOLVED"
      };
    }
    
    if (t.includes("physic") || t.includes("law") || t.includes("newton") || t.includes("force") || t.includes("motion") || t.includes("energy")) {
       return {
         mode: 'physics',
         title: "Physics Simulator",
         bgClass: "bg-indigo-950",
         controls: [
           { id: "mass", type: "slider", target: 50, min: 1, max: 100 },
           { id: "force", type: "slider", target: 80, min: 0, max: 100 },
           { id: "friction", type: "slider", target: 10, min: 0, max: 50 }
         ],
         successText: "KINETIC ENERGY STABILIZED"
       };
    }
    
    // Interactive Teardown Fallback
    let fallbackTheme = {
      mode: 'teardown',
      title: "Interactive Teardown",
      bgClass: "bg-slate-950",
      layers: [
        {
          id: "l1",
          name: "Outer Chassis",
          prompt: "Highly detailed macro photography of a metallic chassis, studio lighting, hyperrealistic, 8k",
          screws: [{id:'s0', x: 15, y: 20}, {id:'s1', x: 85, y: 20}, {id:'s2', x: 15, y: 80}, {id:'s3', x: 85, y: 80}],
          hotspots: [{ x: 30, y: 30, label: "Outer Shell" }, { x: 70, y: 70, label: "Surface Casing" }]
        },
        {
          id: "l2",
          name: "Internal Mechanism",
          prompt: "Highly detailed macro photography of complex internal gears and circuits, hyperrealistic",
          hotspots: [{ x: 50, y: 50, label: "Main Processor / Gear" }]
        },
        {
          id: "l3",
          name: "Core Essence",
          prompt: "Highly detailed macro photography of a glowing energy core, hyperrealistic",
          hotspots: [{ x: 50, y: 50, label: "Absolute Core" }]
        }
      ],
      controls: [],
      successText: "CORE REVEALED"
    };

    if (content) {
      const match = content.match(/<!--\s*TACTILE_DATA:\s*([\s\S]*?)\s*-->/);
      if (match && match[1]) {
        try {
          const parsed = JSON.parse(match[1].trim());
          if (parsed.title && parsed.layers) {
            fallbackTheme.title = parsed.title;
            // Merge in the AI prompts, names, and hotspots
            for (let i = 0; i < 3; i++) {
               if (parsed.layers[i]) {
                  fallbackTheme.layers[i].prompt = parsed.layers[i].prompt || fallbackTheme.layers[i].prompt;
                  fallbackTheme.layers[i].name = parsed.layers[i].name || fallbackTheme.layers[i].name;
                  if (parsed.layers[i].hotspots && parsed.layers[i].hotspots.length > 0) {
                      (fallbackTheme.layers[i] as any).hotspots = parsed.layers[i].hotspots;
                  }
               }
            }
          }
        } catch(e) { console.error("Failed to parse tactile data"); }
      }
    }

    return fallbackTheme;
  };

  const checkInstrumentSuccess = (newValues: Record<string, any>, theme: any) => {
    let success = true;
    
    if (theme.mode === 'teardown') {
      if (newValues['teardown_success']) {
         success = true;
      } else {
         success = false;
      }
    } else {
      for (const ctrl of theme.controls) {
        const val = newValues[ctrl.id];
        if (val === undefined) { success = false; break; }
        if (ctrl.type === "slider") {
          if (Math.abs((val as number) - (ctrl.target as number)) > 0.01) { success = false; break; }
        } else {
          if (val !== ctrl.target) { success = false; break; }
        }
      }
    }
    
    if (success && !tactileSuccess) {
      setTactileSuccess(true);
      setTimeout(() => setTactileSuccess(false), 3000);
    }
  };

  const handleInstrumentChange = (id: string, value: any, theme: any) => {
    const newValues = { ...instrumentValues, [id]: value };
    setInstrumentValues(newValues);
    checkInstrumentSuccess(newValues, theme);
  };

  // Removed Particle Engine Loop
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
            
            // Lowered threshold (40) to accurately detect dark hand silhouettes in backlit/HDR rooms
            if (rDiff + gDiff + bDiff > 40) {
              motionPixels.push({x, y});
            }
          }
        }
        
        // AUTO-EXPOSURE & GRAIN REJECTION LOGIC
        // If > 2000 pixels move at once, it's a camera auto-exposure flash. Ignore the frame entirely.
        if (motionPixels.length > 5 && motionPixels.length < 2000) {
          // Cluster pixels into vertical 40px columns to find the solid arm/hand, ignoring scattered ISO grain noise
          const columns: Record<number, {x: number, y: number}[]> = {};
          for (const p of motionPixels) {
             const colIndex = Math.floor(p.x / 40);
             if (!columns[colIndex]) columns[colIndex] = [];
             columns[colIndex].push(p);
          }

          let densestCol = -1;
          let maxCount = 0;
          for (const key in columns) {
             if (columns[key].length > maxCount) {
                maxCount = columns[key].length;
                densestCol = parseInt(key);
             }
          }

          // If the densest column has enough mass to be a physical hand (ignoring single-pixel noise clusters)
          if (maxCount > 3) {
            const handCluster: {x: number, y: number}[] = [];
            if (columns[densestCol - 1]) handCluster.push(...columns[densestCol - 1]);
            handCluster.push(...columns[densestCol]);
            if (columns[densestCol + 1]) handCluster.push(...columns[densestCol + 1]);

            // Sort ascending by Y (top of screen = 0) to find the fingertips
            handCluster.sort((a, b) => a.y - b.y);
            
            // Take the absolute top 30 pixels of this dense cluster to form the highly stable fingertip center
            const sampleSize = Math.min(30, handCluster.length);
            const tipPixels = handCluster.slice(0, sampleSize);
            
            const avgX = tipPixels.reduce((sum, p) => sum + p.x, 0) / sampleSize;
            const avgY = tipPixels.reduce((sum, p) => sum + p.y, 0) / sampleSize;
            
            // Invert X because the video is mirrored
            const rawX = (avgX / canvas.width) * 100;
            const mappedX = 100 - rawX; 
            const mappedY = (avgY / canvas.height) * 100;
            
            setArCursor(prev => {
              const dx = mappedX - prev.x;
              const dy = mappedY - prev.y;
              
              // VELOCITY CLAMPING (Replaces the broken momentum trap)
              // Instead of freezing the cursor when the hand moves too fast, we simply cap the maximum speed.
              // It can move a max of 20% of the screen per frame. This eliminates instant teleportation glitches 
              // while easily allowing the cursor to reach the far corners!
              const clamp = 20;
              const clampedDx = Math.max(-clamp, Math.min(clamp, dx));
              const clampedDy = Math.max(-clamp, Math.min(clamp, dy));

              // Deadzone (1.0%) to freeze the cursor when the hand stops moving
              if (Math.abs(clampedDx) < 1.0 && Math.abs(clampedDy) < 1.0) return prev;
              return {
                x: prev.x + clampedDx * 0.8,
                y: prev.y + clampedDy * 0.8
              };
            });
          }
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

  // Dynamic Tactile Theme based on Lesson
  const getTactileTheme = (lesson: any) => {
    const title = lesson?.title || "";
    const t = title.toLowerCase();
    
    // Check if AI generated dynamic kinesthetic metadata
    const content = lesson?.content || "";
    if (content) {
      const match = content.match(/<!--\s*TACTILE_DATA:\s*([\s\S]*?)\s*-->/);
      if (match && match[1]) {
        try {
          const parsed = JSON.parse(match[1].trim());
          if (parsed.kinesthetic) {
            return {
              title: parsed.kinesthetic.title || "Simulate Process",
              items: parsed.kinesthetic.items || [
                { id: "item0", label: "INPUT", color: "blue" },
                { id: "item1", label: "PROCESS", color: "amber" },
                { id: "item2", label: "OUTPUT", color: "emerald" }
              ],
              success: parsed.kinesthetic.success || "PROCESS COMPLETE!",
              layout: 'linear',
              bgClass: "bg-slate-950 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px]",
              instructions: parsed.kinesthetic.instructions || [
                "1. Place the first component.",
                "2. Place the second component.",
                "3. Place the final component."
              ]
            };
          }
        } catch(e) {}
      }
    }
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

            {/* TAB: TACTILE SANDBOX */}
            <TabsContent value="tactile" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {(() => {
                const iTheme = getInstrumentTheme(lesson);
                return (
                  <div className={`relative w-full min-h-[550px] border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-8 flex flex-col ${iTheme.bgClass}`}>
                    {/* Metal Panel Background Texture */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000040_2px,transparent_2px),linear-gradient(to_bottom,#00000040_2px,transparent_2px)] bg-[size:100px_100px] opacity-20 pointer-events-none mix-blend-overlay"></div>
                    
                    {/* MODE: INTERACTIVE TEARDOWN */}
                    {iTheme.mode === 'teardown' && (
                      <div className="relative z-10 flex flex-col h-full w-full flex-1 items-center justify-between">
                        <div className="text-center mb-8 relative z-20 pointer-events-none">
                          <h2 className="text-3xl text-teal-400 font-black font-heading tracking-wider uppercase drop-shadow-md">{iTheme.title}</h2>
                          <p className="text-slate-400 font-mono text-sm mt-2">PHYSICALLY TEAR DOWN THE STRUCTURE TO REVEAL THE CORE</p>
                        </div>
                        
                        {/* CURRENT LAYER HUD IDENTIFIER */}
                        <div className="absolute bottom-8 left-8 z-30 bg-black/80 backdrop-blur-md border border-teal-900 rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                           <p className="text-teal-600 font-mono text-[10px] tracking-widest uppercase mb-1">PART IDENTIFICATION RADAR</p>
                           <h3 className="text-teal-300 font-mono font-bold text-lg tracking-wider">
                              {activeHotspot ? activeHotspot.toUpperCase() : (
                                teardownStage === 0 ? ((iTheme as any).layers[0].name.toUpperCase()) :
                                teardownStage === 1 ? ((iTheme as any).layers[1].name.toUpperCase()) :
                                ((iTheme as any).layers[2].name.toUpperCase())
                              )}
                           </h3>
                        </div>
                        
                        <div className="relative w-full max-w-2xl flex-1 flex flex-col items-center justify-center">
                            {/* LAYER 3: CORE ESSENCE */}
                           <div className={`absolute inset-0 m-auto w-[400px] h-[400px] flex items-center justify-center transition-all duration-1000 delay-500 ${teardownStage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
                              <img src={`https://image.pollinations.ai/prompt/${encodeURIComponent((iTheme as any).layers[2].prompt)}?width=400&height=400&nologo=true&seed=${lessonSeed}`} alt="Core" className="w-full h-full object-cover rounded-full shadow-[0_0_150px_rgba(45,212,191,0.5)] border-[4px] border-teal-400/50" />
                              {/* Hotspots for Layer 3 */}
                              {teardownStage >= 2 && ((iTheme as any).layers[2].hotspots || []).map((hotspot: any, idx: number) => (
                                 <div 
                                    key={idx}
                                    className="absolute z-40"
                                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                                 >
                                    {/* Center Target */}
                                    <div 
                                      className="absolute -ml-1 -mt-1 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_15px_#2dd4bf] cursor-crosshair hover:scale-150 transition-all"
                                      onMouseEnter={() => setActiveHotspot(hotspot.label)}
                                      onMouseLeave={() => setActiveHotspot(null)}
                                    >
                                       <div className="absolute -inset-2 rounded-full border border-teal-400/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>
                                    </div>

                                    {/* AR Tech Line */}
                                    <div className="absolute left-1 top-[-1px] w-[25px] h-[1px] bg-teal-400/60 origin-left -rotate-45 pointer-events-none"></div>
                                    <div className="absolute left-[18px] top-[-18px] w-[60px] h-[1px] bg-teal-400/60 pointer-events-none"></div>
                                    
                                    {/* Floating Label */}
                                    <div className="absolute left-[18px] top-[-34px] whitespace-nowrap text-teal-200 font-mono text-[9px] tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none font-bold">
                                       {hotspot.label}
                                    </div>
                                 </div>
                              ))}
                           </div>

                           {/* LAYER 2: INTERNAL MECHANISM */}
                           <div 
                              className={`absolute inset-0 m-auto w-[450px] h-[450px] rounded-[40px] overflow-hidden shadow-2xl transition-all duration-1000 ${teardownStage >= 2 ? 'opacity-0 scale-150 blur-xl pointer-events-none' : teardownStage === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
                           >
                              <img src={`https://image.pollinations.ai/prompt/${encodeURIComponent((iTheme as any).layers[1].prompt)}?width=450&height=450&nologo=true&seed=${lessonSeed}`} alt="Mechanism" className="w-full h-full object-cover" />
                              {/* Hotspots for Layer 2 */}
                              {teardownStage === 1 && ((iTheme as any).layers[1].hotspots || []).map((hotspot: any, idx: number) => (
                                 <div 
                                    key={idx}
                                    className="absolute z-40"
                                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                                 >
                                    {/* Center Target */}
                                    <div 
                                      className="absolute -ml-1 -mt-1 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_15px_#2dd4bf] cursor-crosshair hover:scale-150 transition-all"
                                      onMouseEnter={() => setActiveHotspot(hotspot.label)}
                                      onMouseLeave={() => setActiveHotspot(null)}
                                    >
                                       <div className="absolute -inset-2 rounded-full border border-teal-400/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>
                                    </div>

                                    {/* AR Tech Line */}
                                    <div className="absolute left-1 top-[-1px] w-[25px] h-[1px] bg-teal-400/60 origin-left -rotate-45 pointer-events-none"></div>
                                    <div className="absolute left-[18px] top-[-18px] w-[60px] h-[1px] bg-teal-400/60 pointer-events-none"></div>
                                    
                                    {/* Floating Label */}
                                    <div className="absolute left-[18px] top-[-34px] whitespace-nowrap text-teal-200 font-mono text-[9px] tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none font-bold">
                                       {hotspot.label}
                                    </div>
                                 </div>
                              ))}
                              
                              {/* Mechanism Plate to click/drag away */}
                              {teardownStage === 1 && (
                                 <div 
                                    className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors border-4 border-dashed border-teal-500/50"
                                    onPointerDown={(e) => {
                                       (e.target as HTMLElement).setPointerCapture(e.pointerId);
                                       setLayerOffset({ x: e.clientX, y: e.clientY });
                                    }}
                                    onPointerMove={(e) => {
                                       if (e.buttons === 1) {
                                          const dx = e.clientX - layerOffset.x;
                                          const dy = e.clientY - layerOffset.y;
                                          if (Math.abs(dx) > 200 || Math.abs(dy) > 200) { // Dragged it far enough
                                             setTeardownStage(2);
                                             handleInstrumentChange('teardown_success', true, iTheme);
                                          }
                                          (e.currentTarget as HTMLElement).style.transform = `translate(${dx}px, ${dy}px) rotate(${dx*0.1}deg)`;
                                       }
                                    }}
                                    onPointerUp={(e) => {
                                       if (teardownStage === 1) {
                                          (e.currentTarget as HTMLElement).style.transform = 'translate(0px, 0px) rotate(0deg)';
                                       }
                                    }}
                                 >
                                    <span className="text-teal-400 font-mono font-bold tracking-widest text-lg drop-shadow-md bg-black/60 px-6 py-2 rounded-full border border-teal-500 pointer-events-none">DRAG TO REVEAL</span>
                                 </div>
                              )}
                           </div>

                           {/* LAYER 1: OUTER CHASSIS */}
                           <div 
                              className={`absolute inset-0 m-auto w-[500px] h-[500px] rounded-[60px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] transition-all duration-1000 ${teardownStage >= 1 ? 'opacity-0 scale-125 blur-lg pointer-events-none' : 'opacity-100 scale-100'}`}
                           >
                              <img src={`https://image.pollinations.ai/prompt/${encodeURIComponent((iTheme as any).layers[0].prompt)}?width=500&height=500&nologo=true&seed=${lessonSeed}`} alt="Chassis" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] border-[6px] border-slate-900/40 rounded-[60px] pointer-events-none"></div>
                              
                              {/* Hotspots for Layer 1 */}
                              {teardownStage === 0 && ((iTheme as any).layers[0].hotspots || []).map((hotspot: any, idx: number) => (
                                 <div 
                                    key={idx}
                                    className="absolute z-40"
                                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                                 >
                                    {/* Center Target */}
                                    <div 
                                      className="absolute -ml-1 -mt-1 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_15px_#2dd4bf] cursor-crosshair hover:scale-150 transition-all"
                                      onMouseEnter={() => setActiveHotspot(hotspot.label)}
                                      onMouseLeave={() => setActiveHotspot(null)}
                                    >
                                       <div className="absolute -inset-2 rounded-full border border-teal-400/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>
                                    </div>

                                    {/* AR Tech Line */}
                                    <div className="absolute left-1 top-[-1px] w-[25px] h-[1px] bg-teal-400/60 origin-left -rotate-45 pointer-events-none"></div>
                                    <div className="absolute left-[18px] top-[-18px] w-[60px] h-[1px] bg-teal-400/60 pointer-events-none"></div>
                                    
                                    {/* Floating Label */}
                                    <div className="absolute left-[18px] top-[-34px] whitespace-nowrap text-teal-200 font-mono text-[9px] tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none font-bold">
                                       {hotspot.label}
                                    </div>
                                 </div>
                              ))}
                              
                              {/* The Screws */}
                              {teardownStage === 0 && ((iTheme as any).layers[0].screws || []).map((screw: any) => {
                                 const progress = screwsState[screw.id] || 0;
                                 const isPopped = progress >= 100;
                                 
                                 return (
                                    <div 
                                       key={screw.id}
                                       className={`absolute w-20 h-20 -ml-10 -mt-10 rounded-full flex items-center justify-center transition-all ${isPopped ? 'opacity-0 scale-150 pointer-events-none' : 'cursor-none hover:bg-white/10'}`}
                                       style={{ left: `${screw.x}%`, top: `${screw.y}%` }}
                                       onPointerDown={(e) => {
                                          if (isPopped) return;
                                          setActiveScrew(screw.id);
                                          (e.target as HTMLElement).setPointerCapture(e.pointerId);
                                          setLayerOffset({ x: e.clientX, y: e.clientY }); // Track scrub starting pos
                                       }}
                                       onPointerMove={(e) => {
                                          if (activeScrew === screw.id && e.buttons === 1) {
                                             const dx = Math.abs(e.clientX - layerOffset.x);
                                             const dy = Math.abs(e.clientY - layerOffset.y);
                                             const movement = dx + dy;
                                             
                                             if (movement > 10) {
                                                // Scrubbing adds progress
                                                setScrewsState(prev => {
                                                   const newProgress = Math.min(100, (prev[screw.id] || 0) + movement * 0.1);
                                                   
                                                   // Check if all screws popped
                                                   let allPopped = true;
                                                   for (const s of (iTheme as any).layers[0].screws) {
                                                      if (s.id === screw.id) {
                                                         if (newProgress < 100) allPopped = false;
                                                      } else {
                                                         if ((prev[s.id] || 0) < 100) allPopped = false;
                                                      }
                                                   }
                                                   
                                                   if (newProgress >= 100 && allPopped) {
                                                      setTimeout(() => setTeardownStage(1), 500); // Pop layer
                                                   }
                                                   
                                                   return { ...prev, [screw.id]: newProgress };
                                                });
                                                setLayerOffset({ x: e.clientX, y: e.clientY }); // Reset
                                             }
                                          }
                                       }}
                                       onPointerUp={() => setActiveScrew(null)}
                                    >
                                       {/* Physical Screw Graphic */}
                                       <div 
                                          className={`w-12 h-12 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#94a3b8,_#334155)] shadow-[0_5px_10px_rgba(0,0,0,0.8),inset_0_-2px_5px_rgba(0,0,0,0.5)] border-2 border-slate-900 flex items-center justify-center`}
                                          style={{ transform: `rotate(${progress * 15}deg)` }} // Rotates extremely fast as they scrub
                                       >
                                          {/* Crosshead / Phillips */}
                                          <div className="absolute w-8 h-1 bg-slate-900/80 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"></div>
                                          <div className="absolute w-1 h-8 bg-slate-900/80 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"></div>
                                       </div>
                                       
                                       {/* Active Scrubbing Overlay */}
                                       {activeScrew === screw.id && !isPopped && (
                                          <>
                                             <div className="fixed w-16 h-16 pointer-events-none rounded-full border-4 border-dashed border-teal-400 animate-[spin_1s_linear_infinite]" style={{ left: layerOffset.x - 32, top: layerOffset.y - 32 }}></div>
                                             <div className="absolute w-24 h-24 rounded-full border-4 border-slate-700/50">
                                                <div className="absolute bottom-0 left-0 h-full w-full bg-teal-500/30 rounded-full transition-all" style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}></div>
                                             </div>
                                          </>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                           
                        </div>
                      </div>
                    )}

                    {/* MODE: MICROSCOPE (Biology) */}
                    {iTheme.mode === 'microscope' && (
                      <div className="relative z-10 flex flex-col h-full w-full flex-1">
                        <div className="text-center mb-8"><h2 className="text-3xl text-emerald-400 font-black font-heading tracking-wider uppercase drop-shadow-md">{iTheme.title}</h2></div>
                        <div className="flex-1 flex flex-col md:flex-row gap-12 items-center justify-center">
                          {(() => {
                            const focus = (instrumentValues['focus'] as number) ?? 100;
                            const panX = (instrumentValues['panX'] as number) ?? 0;
                            const panY = (instrumentValues['panY'] as number) ?? 0;
                            const blurAmount = Math.abs(focus - 400) / 20;
                            return (
                              <>
                                <div className="w-80 h-80 md:w-96 md:h-96 rounded-full border-[12px] border-slate-800 bg-black shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden relative cursor-crosshair">
                                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 to-transparent pointer-events-none z-20"></div>
                                  <div className="w-full h-full flex items-center justify-center transition-all duration-75" style={{ filter: `blur(${blurAmount}px)`, transform: `translate(${(panX - 50) * 2}px, ${(panY - 50) * 2}px)` }}>
                                    <div className="w-32 h-32 bg-emerald-500/30 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-[pulse_4s_infinite] border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                      <div className="w-8 h-8 bg-purple-500/50 rounded-full blur-[2px]"></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-6 w-full max-w-[280px]">
                                  <div className="bg-black/60 p-6 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-md">
                                    <p className="text-emerald-400 font-mono text-sm mb-4 text-center font-bold">FINE FOCUS</p>
                                    <input type="range" min="100" max="1000" step="10" value={focus} onChange={e => handleInstrumentChange('focus', parseFloat(e.target.value), iTheme)} className="w-full h-4 bg-slate-800 rounded-full appearance-none cursor-pointer border border-emerald-900 accent-emerald-500 hover:accent-emerald-400 transition-all" />
                                  </div>
                                  <div className="bg-black/60 p-6 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-md space-y-6">
                                    <p className="text-emerald-400 font-mono text-sm text-center font-bold">STAGE PAN (X / Y)</p>
                                    <input type="range" min="0" max="100" value={panX} onChange={e => handleInstrumentChange('panX', parseFloat(e.target.value), iTheme)} className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-emerald-500" />
                                    <input type="range" min="0" max="100" value={panY} onChange={e => handleInstrumentChange('panY', parseFloat(e.target.value), iTheme)} className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-emerald-500" />
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* MODE: ORBITAL (Space) */}
                    {iTheme.mode === 'orbital' && (
                      <div className="relative z-10 flex flex-col h-full w-full flex-1">
                        <div className="text-center mb-8"><h2 className="text-3xl text-amber-400 font-black font-heading tracking-wider uppercase drop-shadow-md">{iTheme.title}</h2></div>
                        <div className="flex-1 flex flex-col md:flex-row gap-12 items-center justify-center">
                          {(() => {
                            const grav = (instrumentValues['grav'] as number) ?? 0;
                            const vel = (instrumentValues['vel'] as number) ?? 0;
                            const thruster = (instrumentValues['thruster'] as boolean) ?? false;
                            const orbitSize = Math.max(50, vel * 2 + grav * 15);
                            const isMatched = Math.abs(grav - 9.8) <= 0.1 && Math.abs(vel - 75) <= 1 && thruster;
                            return (
                              <>
                                <div className="w-80 h-80 md:w-96 md:h-96 rounded-[3rem] border-4 border-slate-700 bg-slate-950 shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 to-transparent">
                                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-600 rounded-full shadow-[0_0_40px_#f59e0b] z-20 border border-amber-300"></div>
                                  <div className="absolute w-[297px] h-[297px] border-2 border-dashed border-white/20 rounded-full"></div>
                                  <div className={`absolute border-2 rounded-full transition-all duration-300 ${thruster ? 'animate-[spin_4s_linear_infinite]' : ''}`} style={{ width: `${orbitSize}px`, height: `${orbitSize}px`, borderColor: isMatched ? '#10b981' : '#3b82f6' }}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-600 rounded-full shadow-[0_0_15px_#60a5fa] border border-blue-200"></div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-6 w-full max-w-[280px]">
                                  <div className="bg-black/60 p-5 rounded-2xl border border-slate-700 backdrop-blur-md">
                                    <p className="text-amber-400 font-mono text-xs mb-3 font-bold">GRAVITY WELL (m/s²)</p>
                                    <input type="range" min="0" max="20" step="0.1" value={grav} onChange={e => handleInstrumentChange('grav', parseFloat(e.target.value), iTheme)} className="w-full h-3 rounded-full appearance-none bg-slate-800 accent-amber-500 hover:accent-amber-400 transition-all cursor-pointer" />
                                    <p className="text-right text-slate-500 font-mono text-[10px] mt-1">{grav.toFixed(1)}</p>
                                  </div>
                                  <div className="bg-black/60 p-5 rounded-2xl border border-slate-700 backdrop-blur-md">
                                    <p className="text-blue-400 font-mono text-xs mb-3 font-bold">ORBITAL VELOCITY (km/s)</p>
                                    <input type="range" min="0" max="100" step="1" value={vel} onChange={e => handleInstrumentChange('vel', parseFloat(e.target.value), iTheme)} className="w-full h-3 rounded-full appearance-none bg-slate-800 accent-blue-500 hover:accent-blue-400 transition-all cursor-pointer" />
                                    <p className="text-right text-slate-500 font-mono text-[10px] mt-1">{vel}</p>
                                  </div>
                                  <div className="bg-black/60 p-5 rounded-2xl border border-slate-700 backdrop-blur-md flex flex-col items-center">
                                    <p className="text-red-400 font-mono text-xs mb-4 font-bold">MAIN THRUSTER</p>
                                    <div onClick={() => handleInstrumentChange('thruster', !thruster, iTheme)} className={`w-20 h-10 rounded-full border-2 cursor-pointer transition-colors relative ${thruster ? 'bg-red-500 border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-slate-800 border-slate-600'}`}>
                                      <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-transform shadow-md ${thruster ? 'translate-x-11' : 'translate-x-1'}`}></div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* MODE: PHYSICS */}
                    {iTheme.mode === 'physics' && (
                      <div className="relative z-10 flex flex-col h-full w-full flex-1">
                        <div className="text-center mb-8"><h2 className="text-3xl text-indigo-400 font-black font-heading tracking-wider uppercase drop-shadow-md">{iTheme.title}</h2></div>
                        <div className="flex-1 flex flex-col md:flex-row gap-12 items-center justify-center">
                          {(() => {
                            const mass = (instrumentValues['mass'] as number) ?? 10;
                            const force = (instrumentValues['force'] as number) ?? 0;
                            const friction = (instrumentValues['friction'] as number) ?? 0;
                            const netForce = Math.max(0, force - friction);
                            const acceleration = mass > 0 ? (netForce / mass) * 10 : 0;
                            const isMatched = Math.abs(mass - 50) <= 2 && Math.abs(force - 80) <= 2 && Math.abs(friction - 10) <= 2;
                            return (
                              <>
                                <div className="w-80 h-80 md:w-96 md:h-96 rounded-2xl border-4 border-slate-700 bg-slate-900 shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden flex items-center justify-center bg-[linear-gradient(to_right,#1e1e1e_1px,transparent_1px),linear-gradient(to_bottom,#1e1e1e_1px,transparent_1px)] bg-[size:40px_40px]">
                                  {/* Floor */}
                                  <div className="absolute bottom-0 w-full h-1/3 bg-slate-800 border-t-2 border-slate-700 flex items-center justify-center">
                                     {friction > 0 && <div className="absolute top-0 left-0 w-full h-2 bg-amber-900/40"></div>}
                                  </div>
                                  
                                  {/* The Mass Block */}
                                  <div className="absolute transition-all duration-300 flex items-center justify-center" style={{ 
                                      width: `${40 + mass}px`, 
                                      height: `${40 + mass}px`, 
                                      bottom: '33.333%',
                                      left: `${20 + (acceleration * 2)}%`,
                                      backgroundColor: isMatched ? '#10b981' : '#6366f1',
                                      boxShadow: isMatched ? '0 0 30px rgba(16,185,129,0.5)' : 'none'
                                  }}>
                                     <span className="text-white font-bold text-xs">{mass}kg</span>
                                     
                                     {/* Force Arrow */}
                                     {force > 0 && (
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 flex items-center ml-2 pointer-events-none">
                                           <div className="bg-red-500 h-2" style={{ width: `${force}px` }}></div>
                                           <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-red-500"></div>
                                        </div>
                                     )}
                                     
                                     {/* Friction Arrow */}
                                     {friction > 0 && (
                                        <div className="absolute right-full bottom-0 flex items-center mr-2 pointer-events-none">
                                           <div className="w-0 h-0 border-t-2 border-t-transparent border-b-2 border-b-transparent border-r-4 border-r-amber-500"></div>
                                           <div className="bg-amber-500 h-1" style={{ width: `${friction}px` }}></div>
                                        </div>
                                     )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-4 w-full max-w-[280px]">
                                  <div className="bg-black/60 p-4 rounded-xl border border-slate-700 backdrop-blur-md">
                                    <p className="text-indigo-400 font-mono text-[10px] mb-2 font-bold">MASS (kg)</p>
                                    <input type="range" min="1" max="100" step="1" value={mass} onChange={e => handleInstrumentChange('mass', parseFloat(e.target.value), iTheme)} className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-indigo-500" />
                                  </div>
                                  <div className="bg-black/60 p-4 rounded-xl border border-slate-700 backdrop-blur-md">
                                    <p className="text-red-400 font-mono text-[10px] mb-2 font-bold">APPLIED FORCE (N)</p>
                                    <input type="range" min="0" max="100" step="1" value={force} onChange={e => handleInstrumentChange('force', parseFloat(e.target.value), iTheme)} className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-red-500" />
                                  </div>
                                  <div className="bg-black/60 p-4 rounded-xl border border-slate-700 backdrop-blur-md">
                                    <p className="text-amber-400 font-mono text-[10px] mb-2 font-bold">FRICTION (N)</p>
                                    <input type="range" min="0" max="50" step="1" value={friction} onChange={e => handleInstrumentChange('friction', parseFloat(e.target.value), iTheme)} className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-amber-500" />
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}

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
                <div className={`w-full h-full absolute inset-0 transition-opacity duration-500 ${isWebcamActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'} ${getTactileTheme(lesson).bgClass}`}>
                  
                  {/* The PIP Camera Feed (Google Meet Style) */}
                  <div className="absolute bottom-8 left-8 w-64 h-48 bg-black rounded-3xl border-2 border-white/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    
                    {/* LIVE TRACKING DEBUGGER: Shows exactly what the AI is locking onto in real-time */}
                    <div className="absolute pointer-events-none w-6 h-6 rounded-full border-[3px] border-red-500 flex items-center justify-center transition-all duration-75 z-50 shadow-[0_0_15px_red]" style={{ left: `${arCursor.x}%`, top: `${arCursor.y}%`, transform: 'translate(-50%, -50%)' }}>
                       <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    </div>
                    
                    <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded-md text-[10px] text-teal-400 font-mono flex items-center gap-2 border border-white/10 backdrop-blur-md">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      SENSOR FEED
                    </div>
                  </div>
                  <canvas ref={hiddenCanvasRef} width={160} height={120} className="hidden" />
                  
                  {/* AR OVERLAY AND GAME LOGIC */}
                  {(() => {
                    const theme = getTactileTheme(lesson);
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
                           const theme = getTactileTheme(lesson);
                           return (theme.instructions || []).map((step: string, idx: number) => {
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
