"use client";

import { use, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, BrainCircuit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAssignments, useSubmissions, useStudents, useUpdateSubmission } from "@/hooks/useSchool";
import { PageHeader, ErrorState, TableSkeleton, EmptyState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { Submission } from "@/types/school";

export default function AssignmentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const { data: assignmentsData, isLoading: isLoadingAssignment } = useAssignments();
  const { data: submissionsData, isLoading: isLoadingSubmissions } = useSubmissions({ assessment_id: id }, 100);
  const { data: studentsData } = useStudents(100);
  const { mutate: updateSubmission, isPending: isUpdating } = useUpdateSubmission();

  const allAssignments = assignmentsData?.pages.flatMap(p => p.data) ?? [];
  const assignment = allAssignments.find(a => a.id === id);

  const allSubmissions = submissionsData?.pages.flatMap(p => p.data) ?? [];
  const assignmentSubmissions = allSubmissions.filter(s => s.assignment_id === id);

  const allStudents = studentsData?.pages.flatMap(p => p.data) ?? [];

  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const selectedSubmission = assignmentSubmissions.find(s => s.id === selectedSubId);
  
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const handleSelectSubmission = (sub: Submission) => {
    setSelectedSubId(sub.id);
    setScore(sub.score?.toString() || "");
    setFeedback(sub.feedback || "");
  };

  const handleSaveGrade = () => {
    if (!selectedSubmission) return;
    updateSubmission({
      id: selectedSubmission.id,
      payload: {
        score: parseFloat(score),
        feedback,
        status: 'graded'
      }
    });
  };

  const handleAIFeedback = () => {
    setFeedback("Great effort! Your arguments are well-structured, but ensure you cite your sources in the second paragraph.");
  };

  if (isLoadingAssignment || isLoadingSubmissions) return <TableSkeleton rows={5} cols={2} />;
  if (!assignment) return <ErrorState error="Assignment not found" />;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher/assignments">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="Review Submissions" subtitle={assignment.title} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Side: Submissions List */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-semibold">Submissions ({assignmentSubmissions.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {assignmentSubmissions.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No submissions yet.</div>
              ) : (
                <div className="flex flex-col">
                  {assignmentSubmissions.map((sub) => {
                    const student = allStudents.find(s => s.id === sub.student_id);
                    const isSelected = selectedSubId === sub.id;
                    const studentName = student ? `${student.first_name} ${student.last_name}` : "Unknown Student";
                    
                    return (
                      <button 
                        key={sub.id} 
                        onClick={() => handleSelectSubmission(sub)}
                        className={`flex items-start gap-3 p-4 text-left border-b transition-colors hover:bg-muted/50 ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-emerald-500/10 text-emerald-600">
                            {student?.first_name?.[0]}{student?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{studentName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${sub.status === 'graded' ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                              {sub.status}
                            </span>
                            {sub.score !== null && <span className="text-[10px] text-muted-foreground">{sub.score}%</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Review Panel */}
        <div className="md:col-span-2">
          {!selectedSubmission ? (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <EmptyState icon={<FileText className="h-10 w-10 text-muted-foreground" />} title="Select a submission" description="Click on a student's name to view their work and grade it." />
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-4 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Student Work</CardTitle>
                    <span className="text-xs text-muted-foreground">Submitted: {format(new Date(selectedSubmission.created_at), "MMM d, yyyy h:mm a")}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedSubmission.content ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedSubmission.content}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/20">
                      <div className="text-center">
                        <FileText className="h-8 w-8 text-violet-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">Assignment_Submission.pdf</p>
                        <Button variant="link" size="sm">Download File</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Grading & Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Score (0-100)</label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="e.g. 95" 
                        className="w-32" 
                        value={score} 
                        onChange={(e) => setScore(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium">Teacher Feedback</label>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-500 hover:text-blue-600 gap-1" onClick={handleAIFeedback}>
                        <BrainCircuit className="h-3 w-3" /> AI Suggestion
                      </Button>
                    </div>
                    <Textarea 
                      placeholder="Write feedback for the student..." 
                      className="resize-none h-24" 
                      value={feedback} 
                      onChange={(e) => setFeedback(e.target.value)} 
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline">Return for Revision</Button>
                    <Button onClick={handleSaveGrade} disabled={isUpdating}>
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Save Grade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
