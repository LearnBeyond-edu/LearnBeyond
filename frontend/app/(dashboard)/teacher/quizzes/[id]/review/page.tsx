"use client";

import { use, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, BrainCircuit, Loader2, Trophy } from "lucide-react";
import Link from "next/link";
import { useQuiz, useSubmissions, useStudents, useUpdateSubmission } from "@/hooks/useSchool";
import { PageHeader, ErrorState, TableSkeleton, EmptyState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { Submission } from "@/types/school";

export default function QuizReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const { data: quiz, isLoading: isLoadingQuiz } = useQuiz(id);
  const { data: submissionsData, isLoading: isLoadingSubmissions } = useSubmissions({ quiz_id: id }, 100);
  const { data: studentsData } = useStudents(100);
  const { mutate: updateSubmission, isPending: isUpdating } = useUpdateSubmission();

  const allSubmissions = submissionsData?.pages.flatMap(p => p.data) ?? [];
  const quizSubmissions = allSubmissions.filter(s => s.quiz_id === id);

  const allStudents = studentsData?.pages.flatMap(p => p.data) ?? [];

  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const selectedSubmission = quizSubmissions.find(s => s.id === selectedSubId);
  
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

  if (isLoadingQuiz || isLoadingSubmissions) return <TableSkeleton rows={5} cols={2} />;
  if (!quiz) return <ErrorState error="Quiz not found" />;

  const questions: any[] = quiz.questions || [];
  
  const getResolvedAnswer = (q: any, rawAnswer: any) => {
    if (!rawAnswer && rawAnswer !== 0) return "No answer";
    let ans = String(rawAnswer).trim();
    if (q.type === "mcq" || q.type === "multiple_choice") {
      const options = q.options || q.choices || [];
      const lower = ans.toLowerCase();
      if (/^[0-9]+$/.test(lower)) {
        const idx = parseInt(lower, 10);
        if (options[idx]) ans = options[idx];
      } else if (/^[a-z]$/.test(lower)) {
        const idx = lower.charCodeAt(0) - 97;
        if (options[idx]) ans = options[idx];
      }
    }
    return ans;
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher/quizzes">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="Review Quiz Responses" subtitle={quiz.title} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Side: Submissions List */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-semibold">Submissions ({quizSubmissions.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {quizSubmissions.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No submissions yet.</div>
              ) : (
                <div className="flex flex-col">
                  {quizSubmissions.map((sub) => {
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
              <EmptyState icon={<FileText className="h-10 w-10 text-muted-foreground" />} title="Select a submission" description="Click on a student's name to view their answers." />
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-4 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-orange-500" />
                      Final Score: <span className="text-orange-500 font-extrabold">{selectedSubmission.score}%</span>
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">Submitted: {format(new Date(selectedSubmission.created_at), "MMM d, yyyy h:mm a")}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {questions.map((q, idx) => {
                    const studentAnsObj = Array.isArray(selectedSubmission.answers) ? selectedSubmission.answers.find((a: any) => a.question_index === idx) : null;
                    const studentAnsRaw = studentAnsObj ? studentAnsObj.answer : null;
                    const correctAnsRaw = q.answer || (q as any).correctAnswer || (q as any).correct_answer;
                    
                    const studentAns = getResolvedAnswer(q, studentAnsRaw);
                    const correctAns = getResolvedAnswer(q, correctAnsRaw);
                    
                    return (
                      <div key={idx} className="border rounded-xl p-4 bg-muted/20 space-y-2">
                        <p className="font-semibold text-sm">
                          <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                          {q.question || (q as any).questionText || (q as any).text}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Student Answer</p>
                            <p className={`text-sm font-semibold ${studentAns === correctAns ? "text-emerald-600" : "text-red-600"}`}>{studentAns}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Correct Answer</p>
                            <p className="text-sm font-semibold text-emerald-600">
                              {correctAns || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Override Grade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Score (0-100)</label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        className="w-32" 
                        value={score} 
                        onChange={(e) => setScore(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <Button onClick={handleSaveGrade} disabled={isUpdating}>
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Update Grade
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
