"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useLearningStore } from "@/store/useLearningStore";
import { useCreateSubmission } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText, ArrowLeft, Upload, CheckCircle, Clock, Sparkles,
  Paperclip, AlertCircle, FileCheck, Trash2, Send, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AssignmentSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = (params.id as string) || "";
  const { user } = useAuthStore();
  const { addXp, addCoins, logActivity } = useLearningStore();
  const createSubmission = useCreateSubmission();

  const [status, setStatus] = useState<"pending" | "submitted" | "graded">("pending");
  const [submissionText, setSubmissionText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([]);
  const [teacherFeedback, setTeacherFeedback] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [comments, setComments] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: "Teacher", text: "Please make sure to cite at least three sources in your lab report.", time: "Yesterday" }
  ]);
  const [newComment, setNewComment] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setUploadedFiles([
        ...uploadedFiles,
        { name: "cell_membrane_analysis.pdf", size: "1.4 MB" }
      ]);
      setIsUploading(false);
      toast.success("File uploaded successfully");
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const name = e.target.files[0].name;
      setTimeout(() => {
        setUploadedFiles([
          ...uploadedFiles,
          { name, size: "940 KB" }
        ]);
        setIsUploading(false);
        toast.success("File uploaded successfully");
      }, 1000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, { sender: "You", text: newComment, time: "Just now" }]);
    setNewComment("");
  };

  const handleRequestAiFeedback = () => {
    if (uploadedFiles.length === 0 && !submissionText.trim()) {
      toast.error("Please add text or upload a file first");
      return;
    }
    setIsAiLoading(true);
    setTimeout(() => {
      setAiFeedback(
        `### Laura AI Assessment Outline\n` +
        `*   **Strengths**: Your cell membrane description is very thorough and outlines phospholipids clearly.\n` +
        `*   **Recommendations**: You missed mentioning transport proteins. Add details about passive vs active transport to secure higher scores.\n` +
        `*   **Estimated Grade**: ~90-95%`
      );
      setIsAiLoading(false);
      toast.success("AI feedback synthesized!");
    }, 1500);
  };

  const handleSubmitWork = () => {
    if (uploadedFiles.length === 0 && !submissionText.trim()) {
      toast.error("Nothing to submit. Write or upload files.");
      return;
    }

    setStatus("submitted");
    addXp(200);
    addCoins(30);
    logActivity("Submitted Assignment", "assignment", 100);
    toast.success("Homework submitted! Gained 200 XP! 🎉");

    // Save submission to database
    if (assignmentId && user) {
      createSubmission.mutate({
        student_id: user.id,
        assessment_type: "assignment",
        assessment_id: assignmentId,
        content: submissionText || "Submitted with files",
        files: uploadedFiles.map(f => f.name),
        status: "submitted"
      });
    }

    // Simulate grading 5 seconds later
    setTimeout(() => {
      setStatus("graded");
      setScore(95);
      setTeacherFeedback("Excellent report! Very neat diagrams and detailed analysis.");
      toast.success("Assignment graded! Final score: 95/100!");
    }, 5000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-xs text-muted-foreground hover:text-foreground font-semibold rounded-xl">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Button>
        <div className="flex gap-2">
          {status === "pending" && (
            <Button onClick={handleSubmitWork} className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white rounded-xl h-9 text-xs font-bold gap-1.5 shadow-sm transition-all">
              <Send className="h-4 w-4" /> Submit Homework
            </Button>
          )}
          {status === "submitted" && (
            <Badge className="bg-amber-500/10 text-amber-600 border-none font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Pending Grading
            </Badge>
          )}
          {status === "graded" && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" /> Graded: {score}/100
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          
          {/* Main workspace */}
          <Card className="border-border/40 shadow-md bg-card/60 backdrop-blur-md overflow-hidden rounded-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-500" />
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
              <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" /> Submission Workspace
              </CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground">Draft your response directly or upload required assignment files.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Text Submission Response</label>
                <Textarea
                  disabled={status !== "pending"}
                  placeholder="Type your homework writeups here..."
                  value={submissionText}
                  onChange={e => setSubmissionText(e.target.value)}
                  className="min-h-[160px] text-xs"
                />
              </div>

              {/* Upload panel */}
              {status === "pending" && (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="group border-2 border-dashed border-teal-500/30 rounded-2xl p-8 text-center bg-teal-500/5 hover:bg-teal-500/10 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                >
                  <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                  <div className="p-4 bg-teal-500/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6 text-teal-600" />
                  </div>
                  <p className="font-extrabold text-sm text-foreground">Click or drag files to upload</p>
                  <p className="text-xs text-muted-foreground mt-1.5">Supports PDF, DOCX, PNG (Max 5MB)</p>
                </div>
              )}

              {/* Uploaded items list */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-[11px] text-muted-foreground">Uploaded Documents</p>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="p-3 bg-muted/30 border rounded-2xl flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-teal-600" />
                        <span>{file.name} ({file.size})</span>
                      </div>
                      {status === "pending" && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setUploadedFiles([])}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teacher and AI Feedback Panel */}
          {(aiFeedback || teacherFeedback) && (
            <div className="grid gap-6 sm:grid-cols-2">
              {/* AI Feedback */}
              {aiFeedback && (
                <Card className="border-border/60 bg-gradient-to-br from-teal-500/5 to-transparent">
                  <CardHeader className="pb-2 border-b border-border/40"><CardTitle className="text-xs font-bold flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-teal-600" /> Laura AI Feedback</CardTitle></CardHeader>
                  <CardContent className="pt-4 text-xs whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {aiFeedback}
                  </CardContent>
                </Card>
              )}

              {/* Teacher Feedback */}
              {teacherFeedback && (
                <Card className="border-border/60">
                  <CardHeader className="pb-2 border-b"><CardTitle className="text-xs font-bold flex items-center gap-1.5"><FileCheck className="h-4 w-4 text-emerald-500" /> Teacher Evaluation</CardTitle></CardHeader>
                  <CardContent className="pt-4 text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>Score:</span>
                      <span className="text-emerald-600">{score}/100</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic">"{teacherFeedback}"</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

          {/* Sidebar Actions & Thread */}
        <div className="space-y-6">
          {/* AI Precheck Trigger */}
          {status === "pending" && (
            <Card className="border-teal-500/30 shadow-lg shadow-teal-500/10 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-16 h-16 text-teal-500" />
              </div>
              <CardContent className="p-5 space-y-4 text-xs relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-teal-500/20 text-teal-600 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-foreground">Laura AI Pre-check</h3>
                </div>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Run an instant AI feedback scan to identify missing outcomes, spelling issues, and vocabulary improvements before you submit.
                </p>
                <Button onClick={handleRequestAiFeedback} disabled={isAiLoading}
                  className="w-full text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all">
                  {isAiLoading ? "Analyzing Document..." : "Run AI Analysis"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Submission Discussion Thread */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-bold">Teacher Discussion</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {comments.map((c, i) => (
                  <div key={i} className={`p-2.5 rounded-2xl border space-y-0.5 ${c.sender === "You" ? "bg-teal-500/5 border-teal-500/20" : "bg-muted/30"}`}>
                    <div className="flex justify-between font-bold text-[9px] text-muted-foreground">
                      <span>{c.sender}</span>
                      <span>{c.time}</span>
                    </div>
                    <p className="leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-1.5 pt-2 border-t">
                <Input placeholder="Reply to teacher..." value={newComment} onChange={e => setNewComment(e.target.value)} className="text-xs h-8" />
                <Button type="submit" size="icon" className="h-8 w-8 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"><Send className="h-3.5 w-3.5" /></Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
