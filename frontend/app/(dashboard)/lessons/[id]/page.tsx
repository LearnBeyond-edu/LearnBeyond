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
  Volume2, VolumeX, Trash2, Edit2, Play, Pause, ChevronLeft, ChevronRight, PenTool,
  Bookmark, Award, Save, RefreshCw, MessageSquare, AlertCircle, Video, Image as ImageIcon,
  Settings, Maximize, ZoomOut, ZoomIn, Download, Loader2, Scan, Hand,
  Layers, Activity, Sliders, RotateCcw, Zap, Compass, ShieldCheck, Flame, Radio, Orbit, Atom, Check, Eye,
  Sun, Globe, Moon, Lightbulb, Battery, Shield, Waves, Magnet, Droplets
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// ==========================================
// TACTILE TOUCH & FEEL PHYSICS SANDBOX (FLAWLESS & RESPONSIVE)
// ==========================================
interface TactilePhysicsSandboxProps {
  config: any;
  tactileItems: Record<string, boolean>;
  setTactileItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  playTactileTone: (freq?: number, duration?: number) => void;
  isCompleted: boolean;
  handleCompleteLesson: () => void;
}

function TactilePhysicsSandbox({
  config,
  tactileItems,
  setTactileItems,
  playTactileTone,
  isCompleted,
  handleCompleteLesson
}: TactilePhysicsSandboxProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tactileMode, setTactileMode] = useState<'gel' | 'fluid' | 'magnetic' | 'gravity'>('gel');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTouchHint, setActiveTouchHint] = useState<string>("Touch, squeeze & drag bodies into the glowing sockets!");

  // Internal physical nodes state
  const nodesRef = useRef<Array<{
    id: string;
    name: string;
    role: string;
    icon: string;
    color: string;
    colorHex: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    targetX: number;
    targetY: number;
    dockX: number;
    dockY: number;
    isDragging: boolean;
    isPlaced: boolean;
    squishX: number;
    squishY: number;
    orbitAngle: number;
  }>>([]);

  const ripplesRef = useRef<Array<{ x: number; y: number; r: number; maxR: number; alpha: number; color: string }>>([]);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }>>([]);
  const magneticSandRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; origX: number; origY: number; color: string }>>([]);
  const gelGridRef = useRef<Array<{ x: number; y: number; origX: number; origY: number; vx: number; vy: number }>>([]);
  
  const pointerRef = useRef<{ x: number; y: number; isDown: boolean; lastX: number; lastY: number; speed: number; activeNodeIdx: number }>({
    x: -999,
    y: -999,
    isDown: false,
    lastX: -999,
    lastY: -999,
    speed: 0,
    activeNodeIdx: -1
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const triggerHapticAudio = (freq: number, duration = 0.12, type: OscillatorType = 'sine') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const getColorHex = (c: string) => {
    switch (c) {
      case 'amber': return '#f59e0b';
      case 'blue': return '#3b82f6';
      case 'teal': return '#14b8a6';
      case 'red': return '#ef4444';
      case 'purple': return '#a855f7';
      case 'emerald': return '#10b981';
      case 'indigo': return '#6366f1';
      default: return '#06b6d4';
    }
  };

  // Resize and position calculation
  const updateDimensionsAndPositions = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(340, Math.floor(rect.width || 760));
    const height = Math.max(280, Math.floor(rect.height || 380));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const centerX = width / 2;
    const centerY = height * 0.42;

    let targets: Array<{ x: number; y: number }> = [];
    if (config.conceptType === 'space') {
      targets = [
        { x: centerX, y: centerY },
        { x: centerX + Math.min(130, width * 0.22), y: centerY },
        { x: centerX + Math.min(200, width * 0.35), y: centerY }
      ];
    } else if (config.conceptType === 'biology') {
      targets = [
        { x: centerX, y: centerY },
        { x: centerX - Math.min(110, width * 0.2), y: centerY + 25 },
        { x: centerX + Math.min(90, width * 0.16), y: centerY - 20 }
      ];
    } else {
      targets = [
        { x: centerX - Math.min(150, width * 0.28), y: centerY },
        { x: centerX, y: centerY },
        { x: centerX + Math.min(150, width * 0.28), y: centerY }
      ];
    }

    // If nodes already exist, update targets and docks smoothly without resetting drag
    if (nodesRef.current.length === config.steps.length) {
      nodesRef.current.forEach((node, idx) => {
        const dockX = (width / 4) * (idx + 1);
        const dockY = height - 52;
        const target = targets[idx] || { x: centerX, y: centerY };
        node.targetX = target.x;
        node.targetY = target.y;
        node.dockX = dockX;
        node.dockY = dockY;
        if (node.isPlaced && !node.isDragging) {
          node.x = target.x;
          node.y = target.y;
        }
      });
    } else {
      // First initialization
      nodesRef.current = config.steps.map((step: any, idx: number) => {
        const isPlaced = !!tactileItems[step.id];
        const dockX = (width / 4) * (idx + 1);
        const dockY = height - 52;
        const target = targets[idx] || { x: centerX, y: centerY };

        return {
          id: step.id,
          name: step.name,
          role: step.role,
          icon: step.icon,
          color: step.color,
          colorHex: getColorHex(step.color),
          x: isPlaced ? target.x : dockX,
          y: isPlaced ? target.y : dockY,
          vx: 0,
          vy: 0,
          radius: idx === 0 ? 30 : idx === 1 ? 25 : 22,
          targetX: target.x,
          targetY: target.y,
          dockX,
          dockY,
          isDragging: false,
          isPlaced,
          squishX: 1,
          squishY: 1,
          orbitAngle: idx * (Math.PI / 2)
        };
      });
    }

    // Initialize Gel Grid
    const cols = 16;
    const rows = 9;
    const cellW = width / (cols - 1);
    const cellH = height / (rows - 1);
    const gel = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx = c * cellW;
        const gy = r * cellH;
        gel.push({ x: gx, y: gy, origX: gx, origY: gy, vx: 0, vy: 0 });
      }
    }
    gelGridRef.current = gel;

    // Initialize Magnetic Sand
    if (magneticSandRef.current.length === 0) {
      const sand = [];
      for (let i = 0; i < 180; i++) {
        const sx = Math.random() * width;
        const sy = Math.random() * height;
        sand.push({
          x: sx,
          y: sy,
          origX: sx,
          origY: sy,
          vx: 0,
          vy: 0,
          color: i % 2 === 0 ? '#14b8a6' : '#38bdf8'
        });
      }
      magneticSandRef.current = sand;
    }
  };

  useEffect(() => {
    updateDimensionsAndPositions();

    const observer = new ResizeObserver(() => {
      updateDimensionsAndPositions();
    });

    if (canvasRef.current) observer.observe(canvasRef.current);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [config.conceptType]);

  // Sync external tactileItems
  useEffect(() => {
    nodesRef.current.forEach(node => {
      const shouldBePlaced = !!tactileItems[node.id];
      if (node.isPlaced !== shouldBePlaced && !node.isDragging) {
        node.isPlaced = shouldBePlaced;
      }
    });
  }, [tactileItems]);

  // 60fps Physical Render Loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      try {
        const width = canvas.width || 760;
        const height = canvas.height || 380;
        ctx.clearRect(0, 0, width, height);

        const pointer = pointerRef.current;
        const nodes = nodesRef.current;
        const allActive = nodes.length === 3 && nodes.every(n => !!tactileItems[n.id]);

        // 1. MEDIUM SIMULATION & BACKGROUND
        if (tactileMode === 'gel') {
          const gel = gelGridRef.current;
          for (let i = 0; i < gel.length; i++) {
            const pt = gel[i];
            const fx = (pt.origX - pt.x) * 0.22;
            const fy = (pt.origY - pt.y) * 0.22;

            if (pointer.isDown && pointer.x > 0) {
              const dx = pointer.x - pt.x;
              const dy = pointer.y - pt.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 110 && dist > 1) {
                const push = ((110 - dist) / 110) * 10;
                pt.vx -= (dx / dist) * push;
                pt.vy -= (dy / dist) * push;
              }
            }

            pt.vx = Math.max(-10, Math.min(10, (pt.vx + fx) * 0.88));
            pt.vy = Math.max(-10, Math.min(10, (pt.vy + fy) * 0.88));
            pt.x += pt.vx;
            pt.y += pt.vy;
          }

          ctx.strokeStyle = 'rgba(20, 184, 166, 0.16)';
          ctx.lineWidth = 1;
          const cols = 16;
          const rows = 9;
          for (let r = 0; r < rows; r++) {
            ctx.beginPath();
            for (let c = 0; c < cols; c++) {
              const pt = gel[r * cols + c];
              if (pt) {
                if (c === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
              }
            }
            ctx.stroke();
          }
          for (let c = 0; c < cols; c++) {
            ctx.beginPath();
            for (let r = 0; r < rows; r++) {
              const pt = gel[r * cols + c];
              if (pt) {
                if (r === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
              }
            }
            ctx.stroke();
          }
        } else if (tactileMode === 'fluid') {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
          ctx.fillRect(0, 0, width, height);
          const time = Date.now() * 0.003;
          for (let y = 30; y < height - 15; y += 28) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.08 + Math.sin(time + y * 0.05) * 0.04})`;
            ctx.lineWidth = 1.5;
            for (let x = 0; x <= width; x += 16) {
              let dy = Math.sin(x * 0.02 + time + y * 0.02) * 4;
              if (pointer.isDown && pointer.x > 0) {
                const dist = Math.hypot(pointer.x - x, pointer.y - y);
                if (dist < 120) {
                  dy += Math.sin((dist - time * 30) * 0.15) * ((120 - dist) / 12);
                }
              }
              if (x === 0) ctx.moveTo(x, y + dy);
              else ctx.lineTo(x, y + dy);
            }
            ctx.stroke();
          }
        } else if (tactileMode === 'magnetic') {
          const sand = magneticSandRef.current;
          sand.forEach(p => {
            let fx = 0;
            let fy = 0;
            if (pointer.isDown && pointer.x > 0) {
              const dx = pointer.x - p.x;
              const dy = pointer.y - p.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 160 && dist > 5) {
                const force = ((160 - dist) / 160) * 10;
                fx += (dx / dist) * force;
                fy += (dy / dist) * force;
              }
            }
            nodes.forEach(node => {
              const ndx = node.x - p.x;
              const ndy = node.y - p.y;
              const ndist = Math.hypot(ndx, ndy);
              if (ndist < 120 && ndist > 8) {
                const nforce = ((120 - ndist) / 120) * 6;
                fx += (ndx / ndist) * nforce;
                fy += (ndy / ndist) * nforce;
              }
            });
            fx += (p.origX - p.x) * 0.04;
            fy += (p.origY - p.y) * 0.04;

            p.vx = Math.max(-8, Math.min(8, (p.vx + fx) * 0.85));
            p.vy = Math.max(-8, Math.min(8, (p.vy + fy) * 0.85));
            p.x += p.vx;
            p.y += p.vy;

            ctx.save();
            ctx.translate(p.x, p.y);
            const angle = Math.atan2(p.vy, p.vx);
            ctx.rotate(angle);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-2.5, 0);
            ctx.lineTo(2.5, 0);
            ctx.stroke();
            ctx.restore();
          });
        } else {
          // Spacetime Gravity Grid
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
          ctx.lineWidth = 1;
          for (let r = 40; r < height - 15; r += 28) {
            ctx.beginPath();
            for (let c = 0; c <= width; c += 16) {
              let depthY = r;
              nodes.forEach(node => {
                const dist = Math.hypot(node.x - c, node.y - r);
                if (dist < 120) {
                  depthY += ((120 - dist) / 120) ** 2 * 22;
                }
              });
              if (pointer.isDown && pointer.x > 0) {
                const pdist = Math.hypot(pointer.x - c, pointer.y - r);
                if (pdist < 90) {
                  depthY += ((90 - pdist) / 90) ** 2 * 16;
                }
              }
              if (c === 0) ctx.moveTo(c, depthY);
              else ctx.lineTo(c, depthY);
            }
            ctx.stroke();
          }
        }

        // 2. ORBIT LINES & CIRCUIT WIRES (ALWAYS ALIGNED WITH TARGET SOCKETS)
        if (config.conceptType === 'space' && nodes[0]) {
          const sun = nodes[0];
          const earthDist = Math.max(0.1, Math.hypot(nodes[1]?.targetX - sun.targetX, nodes[1]?.targetY - sun.targetY) || 110);
          const moonDist = Math.max(0.1, Math.hypot(nodes[2]?.targetX - sun.targetX, nodes[2]?.targetY - sun.targetY) || 170);

          ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(sun.targetX, sun.targetY, earthDist, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(20, 184, 166, 0.25)';
          ctx.beginPath();
          ctx.arc(sun.targetX, sun.targetY, moonDist, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (nodes.length >= 3) {
          // Wire between fixed target sockets
          ctx.strokeStyle = allActive ? 'rgba(34, 197, 94, 0.75)' : 'rgba(148, 163, 184, 0.3)';
          ctx.lineWidth = allActive ? 4 : 2.5;
          ctx.beginPath();
          ctx.moveTo(nodes[0].targetX, nodes[0].targetY);
          ctx.lineTo(nodes[1].targetX, nodes[1].targetY);
          ctx.lineTo(nodes[2].targetX, nodes[2].targetY);
          ctx.stroke();

          if (allActive) {
            const sparkOffset = (Date.now() * 0.12) % 100;
            ctx.fillStyle = '#fef08a';
            ctx.shadowColor = '#fef08a';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            const sparkX = nodes[0].targetX + (nodes[2].targetX - nodes[0].targetX) * (sparkOffset / 100);
            ctx.arc(sparkX, nodes[0].targetY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // 3. TARGET SOCKETS
        nodes.forEach((node, idx) => {
          const tx = node.targetX;
          const ty = node.targetY;
          const isOccupied = !!tactileItems[node.id];
          const nodeRadius = Math.max(0.1, (node.radius || 22) + 8);

          ctx.save();
          ctx.beginPath();
          ctx.arc(tx, ty, nodeRadius, 0, Math.PI * 2);
          ctx.strokeStyle = isOccupied ? node.colorHex : 'rgba(148, 163, 184, 0.35)';
          ctx.lineWidth = isOccupied ? 3 : 2;
          ctx.setLineDash(isOccupied ? [] : [5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          if (!isOccupied) {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`SOCKET ${idx + 1}`, tx, ty);
          }
          ctx.restore();
        });

        // 4. PHYSICAL NODES DYNAMICS & RENDERING
        nodes.forEach((node) => {
          const isPlaced = !!tactileItems[node.id];

          if (node.isDragging) {
            // 1:1 Direct Tracking
            node.x = pointer.x;
            node.y = pointer.y;

            // Magnetic suction towards socket when within 60px
            const distToTarget = Math.hypot(node.x - node.targetX, node.y - node.targetY);
            if (distToTarget < 60) {
              node.x = node.targetX + (node.x - node.targetX) * 0.35;
              node.y = node.targetY + (node.y - node.targetY) * 0.35;
            }
          } else if (isPlaced) {
            // Directly anchor at target socket
            node.x = node.targetX;
            node.y = node.targetY;
            node.vx = 0;
            node.vy = 0;
          } else {
            // Settle at dock location
            node.x = node.dockX;
            node.y = node.dockY;
            node.vx = 0;
            node.vy = 0;
          }

          // Draw Elastic Tension Cord while dragging
          if (node.isDragging) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(node.targetX, node.targetY);
            ctx.lineTo(node.x, node.y);
            ctx.strokeStyle = `${node.colorHex}cc`;
            ctx.lineWidth = 3;
            ctx.stroke();

            const distToTarget = Math.hypot(node.x - node.targetX, node.y - node.targetY);
            if (distToTarget < 100) {
              ctx.beginPath();
              ctx.arc(node.targetX, node.targetY, Math.max(0.1, (node.radius || 22) + 14), 0, Math.PI * 2);
              ctx.strokeStyle = '#22c55e';
              ctx.lineWidth = 3;
              ctx.setLineDash([4, 4]);
              ctx.stroke();
              ctx.setLineDash([]);
            }
            ctx.restore();
          }

          // Draw Node Body
          const rad = Math.max(2, node.radius || 22);
          ctx.save();
          ctx.translate(node.x, node.y);

          ctx.shadowColor = node.colorHex;
          ctx.shadowBlur = isPlaced || node.isDragging ? 24 : 10;

          const grad = ctx.createRadialGradient(-rad * 0.3, -rad * 0.3, 2, 0, 0, rad);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, node.colorHex);
          grad.addColorStop(1, '#0f172a');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          ctx.ellipse(-rad * 0.35, -rad * 0.35, Math.max(0.1, rad * 0.3), Math.max(0.1, rad * 0.18), -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          // Node Label
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.name.split(' ')[0], 0, rad + 14);
          ctx.restore();
        });

        // 5. ALL ACTIVE RESONANCE OVERLAY ON CANVAS
        if (allActive) {
          ctx.save();
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, width - 20, height - 20);
          ctx.restore();
        }

        // 6. TOUCH SHOCKWAVES
        const ripples = ripplesRef.current;
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.r += 4.5;
          r.alpha *= 0.94;
          const safeR = Math.max(0.1, Math.abs(r.r));
          ctx.save();
          ctx.beginPath();
          ctx.arc(r.x, r.y, safeR, 0, Math.PI * 2);
          ctx.strokeStyle = r.color.replace(')', `, ${Math.max(0, r.alpha)})`).replace('rgb', 'rgba');
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
          if (r.alpha < 0.02 || r.r > r.maxR) ripples.splice(i, 1);
        }

        // 7. BURST PARTICLES (SAFE POSITIVE RADIUS)
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          const alpha = Math.max(0, Math.min(1, 1 - p.life / p.maxLife));
          const safeSize = Math.max(0.1, (p.size || 3) * alpha);
          ctx.save();
          ctx.fillStyle = `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, safeSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          if (p.life >= p.maxLife) particles.splice(i, 1);
        }
      } catch (err) {
        console.warn("Tactile render frame recovered:", err);
      } finally {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [tactileMode, soundEnabled, tactileItems]);

  // Pointer Handlers with Accurate Coordinate Scaling
  const getScaledCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width ? canvas.width / rect.width : 1;
    const scaleY = rect.height ? canvas.height / rect.height : 1;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getScaledCoordinates(e);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    const nodes = nodesRef.current;
    let pickedIndex = -1;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist <= node.radius + 24) {
        pickedIndex = i;
        break;
      }
    }

    pointerRef.current = {
      x,
      y,
      isDown: true,
      lastX: x,
      lastY: y,
      speed: 0,
      activeNodeIdx: pickedIndex
    };

    if (pickedIndex !== -1) {
      const node = nodes[pickedIndex];
      node.isDragging = true;
      triggerHapticAudio(340, 0.12, 'sine');
      setActiveTouchHint(`Dragging ${node.name} • Release into the glowing socket.`);
    } else {
      // Check if user clicked directly on any target socket to toggle it
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const socketDist = Math.hypot(node.targetX - x, node.targetY - y);
        if (socketDist <= node.radius + 20) {
          const nextState = !tactileItems[node.id];
          node.isPlaced = nextState;
          node.x = nextState ? node.targetX : node.dockX;
          node.y = nextState ? node.targetY : node.dockY;
          node.vx = 0;
          node.vy = 0;
          setTactileItems(prev => ({ ...prev, [node.id]: nextState }));
          triggerHapticAudio(nextState ? 523 : 220, 0.15);
          return;
        }
      }

      ripplesRef.current.push({
        x,
        y,
        r: 8,
        maxR: 150,
        alpha: 0.8,
        color: 'rgb(20, 184, 166)'
      });
      triggerHapticAudio(220, 0.08, 'triangle');
      setActiveTouchHint("Tactile impulse wave propagated across the medium.");
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerRef.current.isDown) return;
    const { x, y } = getScaledCoordinates(e);

    const prev = pointerRef.current;
    const speed = Math.hypot(x - prev.lastX, y - prev.lastY);
    pointerRef.current = {
      x,
      y,
      isDown: true,
      lastX: x,
      lastY: y,
      speed,
      activeNodeIdx: prev.activeNodeIdx
    };

    if (prev.activeNodeIdx !== -1 && nodesRef.current[prev.activeNodeIdx]) {
      const node = nodesRef.current[prev.activeNodeIdx];
      const distToTarget = Math.hypot(node.x - node.targetX, node.y - node.targetY);
      if (speed > 3) {
        const pitch = Math.min(800, 280 + distToTarget * 1.4);
        triggerHapticAudio(pitch, 0.04, 'sine');
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    const activeIdx = pointerRef.current.activeNodeIdx;
    const currentX = pointerRef.current.x;
    const currentY = pointerRef.current.y;
    pointerRef.current.isDown = false;
    pointerRef.current.activeNodeIdx = -1;

    if (activeIdx !== -1 && nodesRef.current[activeIdx]) {
      const node = nodesRef.current[activeIdx];
      node.isDragging = false;
      const distToTarget = Math.hypot(node.x - node.targetX, node.y - node.targetY);
      const pointerDist = Math.hypot(currentX - node.targetX, currentY - node.targetY);

      // Snap if released within 100px of target OR if pointer was over target
      if (distToTarget < 100 || pointerDist < 100) {
        node.isPlaced = true;
        node.x = node.targetX;
        node.y = node.targetY;
        node.vx = 0;
        node.vy = 0;

        triggerHapticAudio(523, 0.2, 'sine');
        setTimeout(() => triggerHapticAudio(659, 0.25, 'sine'), 70);

        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20;
          particlesRef.current.push({
            x: node.targetX,
            y: node.targetY,
            vx: Math.cos(angle) * (3 + Math.random() * 3),
            vy: Math.sin(angle) * (3 + Math.random() * 3),
            life: 0,
            maxLife: 25 + Math.random() * 15,
            color: node.colorHex || '#14b8a6',
            size: 3 + Math.random() * 2
          });
        }

        ripplesRef.current.push({
          x: node.targetX,
          y: node.targetY,
          r: 5,
          maxR: 160,
          alpha: 0.9,
          color: 'rgb(34, 197, 94)'
        });

        setTactileItems(prev => ({ ...prev, [node.id]: true }));
        toast.success(`Snapped ${node.name} into place!`);
        setActiveTouchHint(`✅ ${node.name} is securely anchored. Drag the next item!`);
      } else {
        // If it was released far away from socket, unplace it
        node.isPlaced = false;
        node.x = node.dockX;
        node.y = node.dockY;
        node.vx = 0;
        node.vy = 0;

        triggerHapticAudio(180, 0.14, 'triangle');
        setTactileItems(prev => ({ ...prev, [node.id]: false }));
        setActiveTouchHint("Spring rebound! Drag closer to the socket to anchor.");
      }
    }
  };

  const activeCount = Object.values(tactileItems).filter(Boolean).length;
  const isAllActive = activeCount === 3;

  return (
    <div ref={containerRef} className="relative w-full rounded-3xl border border-slate-800 bg-slate-950/95 overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-slate-100">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/30 via-slate-950 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415510_1px,transparent_1px),linear-gradient(to_bottom,#33415510_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* TOP HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-xs font-semibold px-3 py-1">
              {config.badge}
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              Tactile Physics Sandbox ({activeCount}/3 Anchored)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            {config.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {config.subtitle}
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setTactileItems({ item1: false, item2: false, item3: false });
              nodesRef.current.forEach(n => {
                n.isPlaced = false;
                n.x = n.dockX;
                n.y = n.dockY;
                n.vx = 0;
                n.vy = 0;
              });
              triggerHapticAudio(280, 0.2);
              toast.info("Tactile sandbox reset.");
            }}
            className="h-9 rounded-xl border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Canvas
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`h-9 w-9 rounded-xl border-slate-800 ${soundEnabled ? 'bg-slate-900 text-teal-400 border-teal-500/30' : 'bg-slate-900/50 text-slate-500'}`}
            title={soundEnabled ? "Haptic Audio: On" : "Haptic Audio: Off"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* SENSORY MATERIAL MODE BAR */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/90 p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono text-slate-400 px-2 flex items-center gap-1.5">
            <Hand className="h-3.5 w-3.5 text-teal-400" /> Touch Feel:
          </span>
          <button
            onClick={() => { setTactileMode('gel'); triggerHapticAudio(400); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${tactileMode === 'gel' ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20' : 'bg-slate-800/80 text-slate-300 hover:text-white'}`}
          >
            🧪 Squishy Elastic Gel
          </button>
          <button
            onClick={() => { setTactileMode('fluid'); triggerHapticAudio(480); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${tactileMode === 'fluid' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-800/80 text-slate-300 hover:text-white'}`}
          >
            <Waves className="h-3.5 w-3.5" /> Liquid Waves
          </button>
          <button
            onClick={() => { setTactileMode('magnetic'); triggerHapticAudio(540); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${tactileMode === 'magnetic' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-800/80 text-slate-300 hover:text-white'}`}
          >
            <Magnet className="h-3.5 w-3.5" /> Magnetic Sand
          </button>
          <button
            onClick={() => { setTactileMode('gravity'); triggerHapticAudio(360); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${tactileMode === 'gravity' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-800/80 text-slate-300 hover:text-white'}`}
          >
            <Orbit className="h-3.5 w-3.5" /> Spacetime Fabric
          </button>
        </div>

        {/* Pulse Shockwave Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            ripplesRef.current.push({
              x: canvas.width / 2,
              y: canvas.height * 0.44,
              r: 10,
              maxR: 240,
              alpha: 0.9,
              color: 'rgb(20, 184, 166)'
            });
            triggerHapticAudio(300, 0.35, 'triangle');
            toast.success("Tactile impulse wave discharged!");
          }}
          className="text-xs text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 font-bold"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          Pulse Shockwave
        </Button>
      </div>

      {/* MAIN INTERACTIVE CANVAS */}
      <div className="relative z-10 w-full rounded-2xl border-2 border-slate-800 bg-slate-950/80 overflow-hidden shadow-inner flex flex-col items-center select-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-[360px] sm:h-[400px] cursor-grab active:cursor-grabbing touch-none block"
        />

        {/* Live Touch Feedback Bar */}
        <div className="w-full bg-slate-900/90 border-t border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
            {activeTouchHint}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Drag bodies into glowing sockets • Release to snap
          </span>
        </div>
      </div>

      {/* 3 SYNCHRONIZED STEP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {config.steps.map((step: any, index: number) => {
          const isActive = tactileItems[step.id];

          return (
            <div
              key={step.id}
              onClick={() => {
                const nextState = !isActive;
                setTactileItems(prev => ({ ...prev, [step.id]: nextState }));
                const node = nodesRef.current[index];
                if (node) {
                  node.isPlaced = nextState;
                  node.x = nextState ? node.targetX : node.dockX;
                  node.y = nextState ? node.targetY : node.dockY;
                  node.vx = 0;
                  node.vy = 0;
                }
                triggerHapticAudio(nextState ? 420 + index * 80 : 260);
              }}
              className={`p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 shadow-lg ${isActive ? 'bg-teal-950/40 border-teal-500 shadow-teal-500/10 transform -translate-y-1' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${isActive ? 'bg-teal-500/20 border-teal-400 text-teal-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {step.icon === 'Sun' && <Sun className="h-5 w-5" />}
                    {step.icon === 'Globe' && <Globe className="h-5 w-5" />}
                    {step.icon === 'Moon' && <Moon className="h-5 w-5" />}
                    {step.icon === 'Shield' && <Shield className="h-5 w-5" />}
                    {step.icon === 'Zap' && <Zap className="h-5 w-5" />}
                    {step.icon === 'Atom' && <Atom className="h-5 w-5" />}
                    {step.icon === 'Battery' && <Battery className="h-5 w-5" />}
                    {step.icon === 'Lightbulb' && <Lightbulb className="h-5 w-5" />}
                    {step.icon === 'Layers' && <Layers className="h-5 w-5" />}
                    {step.icon === 'Sparkles' && <Sparkles className="h-5 w-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                      STEP {step.stepNumber}
                    </span>
                    <h4 className={`text-sm font-bold font-heading ${isActive ? 'text-teal-300' : 'text-white'}`}>
                      {step.name}
                    </h4>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${isActive ? 'bg-teal-500 border-teal-400 text-slate-950 font-bold' : 'border-slate-700 text-transparent'}`}>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {step.desc}
              </p>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-teal-400/90 font-sans block">
                  💡 {step.fact}
                </span>
              </div>

              <Button
                size="sm"
                className={`w-full h-8 rounded-xl font-bold text-xs mt-1 transition-all ${isActive ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
              >
                {isActive ? "Anchored (Tap to Detach)" : "Tap or Drag into Canvas Socket"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* COMPLETION MASTERY BANNER */}
      {isAllActive && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-950 border-2 border-teal-400 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="p-3 bg-teal-500/20 rounded-2xl text-teal-400">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-heading">
                {config.successTitle}
              </h4>
              <p className="text-xs text-teal-300/90 mt-0.5">
                {config.successSummary}
              </p>
            </div>
          </div>

          <Button
            onClick={handleCompleteLesson}
            disabled={isCompleted}
            className="rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm h-11 px-6 shadow-lg shadow-teal-500/20 gap-2 shrink-0"
          >
            <CheckCircle className="h-4 w-4" />
            {isCompleted ? "Lesson Mastered" : "Mark Lesson Mastered"}
          </Button>
        </div>
      )}
    </div>
  );
}

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
  const smoothArCursorRef = useRef({ x: 50, y: 50 });
  const [arPickedItem, setArPickedItem] = useState<number | null>(null);
  const [arPlacedItems, setArPlacedItems] = useState({ 0: false, 1: false, 2: false });
  const [arExplosion, setArExplosion] = useState(false);

  // --- HANDS-ON TACTILE LAB STATE ---
  const [tactileItems, setTactileItems] = useState<Record<string, boolean>>({ item1: false, item2: false, item3: false });
  const [tactileEnergySpeed, setTactileEnergySpeed] = useState<number>(1); // 1: Normal, 2: High Speed, 3: Turbo
  const [isSimulatingPulse, setIsSimulatingPulse] = useState(false);
  const [tactileSound, setTactileSound] = useState(true);

  // Friendly Audio Chime Synthesizer
  const playTactileTone = (freq = 440, duration = 0.16) => {
    if (typeof window === 'undefined' || !tactileSound) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Easy Hands-on Lab Configuration
  const getTactileLabConfig = (lessonData: any) => {
    const title = lessonData?.title || "";
    const content = lessonData?.content || "";
    const t = title.toLowerCase();

    if (t.includes("solar") || t.includes("planet") || t.includes("space") || t.includes("star") || t.includes("earth") || t.includes("orbit")) {
      return {
        conceptType: "space",
        title: "Hands-On Solar System Lab",
        subtitle: "Touch and activate each celestial body to build a working planetary orbit!",
        badge: "Astronomy & Gravity",
        accentColor: "amber",
        steps: [
          {
            id: "item1",
            stepNumber: 1,
            name: "Ignite the Sun",
            role: "Center Star & Gravity Well",
            desc: "The massive gravitational anchor holding planets in stable orbit.",
            icon: "Sun",
            color: "amber",
            fact: "The Sun contains 99.8% of all mass in our solar system!"
          },
          {
            id: "item2",
            stepNumber: 2,
            name: "Launch Planet Earth",
            role: "Habitable Goldilocks Zone",
            desc: "The middle orbit where liquid water and atmosphere can thrive.",
            icon: "Globe",
            color: "blue",
            fact: "Earth is situated at the perfect distance for life to flourish."
          },
          {
            id: "item3",
            stepNumber: 3,
            name: "Tether the Moon",
            role: "Natural Satellite & Tides",
            desc: "The outer orbital partner that stabilizes Earth's axial tilt and tides.",
            icon: "Moon",
            color: "teal",
            fact: "The Moon's gravitational pull controls our ocean tides every day."
          }
        ],
        pulseLabel: "Simulate Solar Gravitational Flare",
        successTitle: "Solar System Active & In Perfect Orbit!",
        successSummary: "All gravitational forces are balanced. The planets and moon are orbiting smoothly!"
      };
    }

    if (t.includes("cell") || t.includes("biol") || t.includes("plant") || t.includes("animal") || t.includes("gene") || t.includes("dna") || t.includes("body")) {
      return {
        conceptType: "biology",
        title: "Hands-On Living Cell Builder",
        subtitle: "Touch and place each vital organelle to bring the microscopic cell to life!",
        badge: "Cellular Biology",
        accentColor: "emerald",
        steps: [
          {
            id: "item1",
            stepNumber: 1,
            name: "Build Cell Membrane",
            role: "Protective Outer Barrier",
            desc: "A selective shield that protects the cell and controls what enters.",
            icon: "Shield",
            color: "teal",
            fact: "The membrane is like a security guard deciding who gets in and out."
          },
          {
            id: "item2",
            stepNumber: 2,
            name: "Place Mitochondria",
            role: "Cellular Powerhouse",
            desc: "Generates ATP chemical energy to fuel all cell activities.",
            icon: "Zap",
            color: "amber",
            fact: "Mitochondria convert the food we eat into usable cellular energy!"
          },
          {
            id: "item3",
            stepNumber: 3,
            name: "Insert DNA Nucleus",
            role: "Master Control Center",
            desc: "Contains all the genetic blueprints and instructions for life.",
            icon: "Atom",
            color: "purple",
            fact: "The nucleus holds all the DNA code that makes living organisms unique."
          }
        ],
        pulseLabel: "Simulate ATP Cellular Energy Surge",
        successTitle: "Cell Alive & Fully Synthesized!",
        successSummary: "The protective membrane, energy generators, and DNA control center are working together!"
      };
    }

    if (t.includes("physic") || t.includes("force") || t.includes("motion") || t.includes("energy") || t.includes("mechanic") || t.includes("newton") || t.includes("electric")) {
      return {
        conceptType: "physics",
        title: "Hands-On Energy & Circuit Lab",
        subtitle: "Connect the power source, conductor, and motor to complete the kinetic circuit!",
        badge: "Physics & Energy",
        accentColor: "indigo",
        steps: [
          {
            id: "item1",
            stepNumber: 1,
            name: "Connect 12V Battery",
            role: "Electrical Potential Source",
            desc: "Provides voltage pressure to push electrons through the wire.",
            icon: "Battery",
            color: "red",
            fact: "Voltage is the electrical pressure that drives current forward."
          },
          {
            id: "item2",
            stepNumber: 2,
            name: "Close Circuit Switch",
            role: "Current Flow Conductor",
            desc: "Completes the closed loop so energy can travel without interruption.",
            icon: "Zap",
            color: "amber",
            fact: "Electricity can only flow when there is a continuous, unbroken path."
          },
          {
            id: "item3",
            stepNumber: 3,
            name: "Power the Kinetic Motor",
            role: "Energy Transformer",
            desc: "Converts electrical current into mechanical rotation and light.",
            icon: "Lightbulb",
            color: "emerald",
            fact: "Energy cannot be destroyed—it only changes from electrical to kinetic form!"
          }
        ],
        pulseLabel: "Send High-Voltage Power Surge",
        successTitle: "Circuit Complete & Motor Spinning!",
        successSummary: "Current is flowing continuously and the motor is generating kinetic energy!"
      };
    }

    // General Science / CS / Chemistry Lab
    return {
      conceptType: "general",
      title: "Hands-On Concept Discovery Lab",
      subtitle: "Touch and activate the 3 core foundations to complete your interactive experiment!",
      badge: "Hands-On Learning",
      accentColor: "teal",
      steps: [
        {
          id: "item1",
          stepNumber: 1,
          name: "1. Core Foundation",
          role: "Initial Input & Source",
          desc: "Sets the baseline input parameters for the interactive system.",
          icon: "Layers",
          color: "blue",
          fact: "Every successful system starts with a strong, well-defined foundation."
        },
        {
          id: "item2",
          stepNumber: 2,
          name: "2. Active Engine",
          role: "Process & Transformation",
          desc: "Transforms inputs through logical rules, reactions, or mechanics.",
          icon: "Zap",
          color: "amber",
          fact: "The core engine processes inputs and drives the main reaction."
        },
        {
          id: "item3",
          stepNumber: 3,
          name: "3. Result Output",
          role: "Stable Completed State",
          desc: "Achieves full operational harmony and demonstrates the final concept.",
          icon: "Sparkles",
          color: "emerald",
          fact: "When all components link together, the system functions seamlessly!"
        }
      ],
      pulseLabel: "Test Interactive Reaction Pulse",
      successTitle: "Experiment Complete & Synchronized!",
      successSummary: "All 3 components are active and balanced in complete harmony!"
    };
  };

  // Removed Particle Engine Loop
  useEffect(() => {
    let animationFrameId: number;
    let previousImageData: ImageData | null = null;
    
    const detectMotion = () => {
      const video = videoRef.current;
      const canvas = hiddenCanvasRef.current;
      if (!video || !canvas || video.paused || video.ended || video.readyState < 2) {
        if (isWebcamActive) {
          animationFrameId = requestAnimationFrame(detectMotion);
        }
        return;
      }
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        if (isWebcamActive) {
          animationFrameId = requestAnimationFrame(detectMotion);
        }
        return;
      }
      
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
            
            // ADAPTIVE LOW-PASS FILTER & EXPONENTIAL SMOOTHING (Zero jitter/shake)
            const curr = smoothArCursorRef.current;
            const deltaX = mappedX - curr.x;
            const deltaY = mappedY - curr.y;
            const dist = Math.hypot(deltaX, deltaY);

            // Filter out camera ISO grain micro-tremor (< 0.4% screen size)
            if (dist > 0.4) {
              // Adaptive smoothing: ultra-smooth on small adjustments, responsive on fast swipes
              const alpha = Math.min(0.65, Math.max(0.20, dist * 0.07));
              const nextX = Math.max(5, Math.min(95, curr.x + deltaX * alpha));
              const nextY = Math.max(5, Math.min(95, curr.y + deltaY * alpha));
              
              smoothArCursorRef.current = { x: nextX, y: nextY };
              setArCursor({ x: nextX, y: nextY });
            }
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
    // Balanced hit tolerance (8.5%) for intuitive, forgiving grabbing & snapping
    const threshold = 8.5;

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

  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(() => {});
      };
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream, isWebcamActive, hasCameraStream]);

  const startSimulation = async (withCamera = true) => {
    if (isWebcamActive) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
      setHasCameraStream(false);
      setArPickedItem(null);
      setArPlacedItems({ 0: false, 1: false, 2: false });
      setArExplosion(false);
    } else {
      setIsWebcamActive(true);
      if (withCamera && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user"
            },
            audio: false
          });
          setCameraStream(stream);
          setHasCameraStream(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          toast.success("Webcam AR Motion Sensor Engaged! Move your hand in front of the camera.");
        } catch (err) {
          console.warn("Webcam access error:", err);
          setCameraStream(null);
          setHasCameraStream(false);
          toast.info("Webcam not accessible. Interactive Virtual Hand mouse tracking is active!");
        }
      } else {
        setCameraStream(null);
        setHasCameraStream(false);
        toast.info("Virtual Hand simulation engaged. Move your cursor to assemble!");
      }
    }
  };

  const toggleWebcam = () => startSimulation(true);

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
    createProgress.mutate({
      student_id: user?.id || "s-1",
      student_name: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Alex Johnson",
      lesson_id: lessonId,
      completion_percentage: 100,
      status: "completed"
    });
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
              <TabsTrigger value="tactile" className="text-sm sm:text-base py-3 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold transition-all">Hands-On Lab</TabsTrigger>
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

            {/* TAB: HANDS-ON CONCEPT LAB (TACTILE TOUCH & FEEL SANDBOX) */}
            <TabsContent value="tactile" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {(() => {
                const config = getTactileLabConfig(lesson);
                const activeCount = Object.values(tactileItems).filter(Boolean).length;
                const isAllActive = activeCount === 3;

                return <TactilePhysicsSandbox config={config} tactileItems={tactileItems} setTactileItems={setTactileItems} playTactileTone={playTactileTone} isCompleted={isCompleted} handleCompleteLesson={handleCompleteLesson} />;
              })()}
            </TabsContent>

            {/* TAB: KINESTHETIC ARENA */}
            <TabsContent value="kinesthetic" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div 
                onPointerMove={(e) => {
                  if (!isWebcamActive) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  const clampedX = Math.max(5, Math.min(95, x));
                  const clampedY = Math.max(5, Math.min(95, y));
                  smoothArCursorRef.current = { x: clampedX, y: clampedY };
                  setArCursor({ x: clampedX, y: clampedY });
                }}
                className={`p-8 border border-border/60 rounded-3xl bg-black overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${isWebcamActive ? '!fixed !inset-0 !z-[9999] !w-[100vw] !h-[100vh] !rounded-none !border-none !m-0 !p-0 !max-w-none cursor-crosshair' : ''}`}
              >
                
                {/* Major Screen Background (Virtual Environment) */}
                <div className={`w-full h-full absolute inset-0 transition-opacity duration-500 ${isWebcamActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'} ${getTactileTheme(lesson).bgClass}`}>
                  
                  {/* The PIP Camera Feed */}
                  <div className={`absolute bottom-8 left-8 w-64 h-48 bg-black rounded-3xl border-2 border-teal-500/40 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 transition-all duration-300 ${hasCameraStream ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none'}`}>
                    <video 
                      ref={(el) => {
                        videoRef.current = el;
                        if (el && cameraStream && el.srcObject !== cameraStream) {
                          el.srcObject = cameraStream;
                          el.onloadedmetadata = () => { el.play().catch(() => {}); };
                          el.play().catch(() => {});
                        }
                      }} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover scale-x-[-1]" 
                    />
                    
                    {/* LIVE TRACKING DEBUGGER */}
                    <div className="absolute pointer-events-none w-6 h-6 rounded-full border-[3px] border-red-500 flex items-center justify-center z-50 shadow-[0_0_15px_red] will-change-transform" style={{ left: `${arCursor.x}%`, top: `${arCursor.y}%`, transform: 'translate(-50%, -50%)' }}>
                       <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    </div>
                    
                    <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded-md text-[10px] text-teal-400 font-mono flex items-center gap-2 border border-white/10 backdrop-blur-md">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      CAMERA SENSOR FEED
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
                          AR KINESTHETIC ARENA ACTIVE
                        </div>

                        {/* Success Explosion */}
                        {arExplosion && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500 pointer-events-auto">
                            <h2 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 animate-[pulse_1s_infinite] drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] font-heading uppercase tracking-widest scale-150">
                              EXCELLENCE!
                            </h2>
                            <p className="mt-8 text-xl font-bold text-white tracking-widest uppercase bg-teal-900/50 px-6 py-2 rounded-full border border-teal-500 mb-12">{theme.success}</p>
                            
                            <Button 
                              onClick={() => startSimulation(false)} 
                              className="relative z-50 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg px-12 py-6 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-300 pointer-events-auto"
                            >
                              COMPLETE & EXIT ARENA
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
                              className={`absolute w-32 h-32 rounded-3xl border-4 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${isPlaced ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-110' : 'border-white/40 bg-black/20'}`}
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
                            className="absolute w-28 h-28 rounded-2xl flex flex-col items-center justify-center pointer-events-none will-change-transform"
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
                            className="absolute w-24 h-24 pointer-events-none z-40 will-change-transform"
                            style={{ left: `${arCursor.x}%`, top: `${arCursor.y}%`, transform: 'translate(-50%, -50%)' }}
                          >
                            <Hand className={`w-16 h-16 transition-colors duration-200 drop-shadow-[0_0_20px_rgba(45,212,191,0.8)] ${arPickedItem !== null ? 'text-amber-400 scale-90' : 'text-teal-400'}`} />
                            {arPickedItem === null && <span className="absolute -bottom-2 left-4 whitespace-nowrap text-[10px] font-bold text-teal-300 drop-shadow-md bg-black/50 px-2 py-1 rounded">VIRTUAL HAND</span>}
                          </div>
                        )}

                      </div>
                    );
                  })()}
                  
                  <div className="absolute top-6 right-6 bg-black/60 px-3 py-1.5 rounded-md border border-teal-500/30 text-teal-400 font-mono text-xs font-bold tracking-widest pointer-events-auto">
                      <Button onClick={() => startSimulation(false)} variant="ghost" className="h-6 hover:bg-red-500/20 hover:text-red-400 text-xs text-white p-2">
                        Exit Arena
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
                      <h3 className="text-2xl font-bold font-heading text-white mb-2">Kinesthetic Multi-Sensory Arena</h3>
                      <p className="text-sm text-slate-300">Interact with planetary & physical components using your webcam gestures or your interactive mouse/touch virtual hand.</p>
                    </div>
                    <div className="space-y-3">
                      <Button onClick={() => startSimulation(true)} className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white rounded-full h-12 px-8 w-full font-bold shadow-lg shadow-teal-900/50 text-base">
                        Start Webcam AR Simulation
                      </Button>
                      <Button onClick={() => startSimulation(false)} variant="outline" className="border-white/20 hover:bg-white/10 text-white rounded-full h-10 px-6 w-full text-xs font-semibold">
                        Launch Virtual Hand (Mouse / Touch Mode)
                      </Button>
                    </div>
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
