"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuiz, useCreateSubmission, useSubmissions } from "@/hooks/useSchool";
import { useLearningStore } from "@/store/useLearningStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Clock, HelpCircle, CheckCircle, AlertCircle, Sparkles,
  Trophy, Award, RefreshCw, BarChart2, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Question {
  type: "mcq" | "tf" | "fill" | "multiple_choice" | "true_false" | "short_answer";
  question?: string;
  questionText?: string;
  text?: string;
  options?: string[];
  choices?: string[];
  answer?: string;
  correctAnswer?: string;
  correct_answer?: string;
  marks?: number;
}

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = (params.id as string) || "";

  const { data: quiz, isLoading, isError } = useQuiz(quizId);
  const { addXp, addCoins, logActivity } = useLearningStore();
  const authUser = useAuthStore((state) => state.user);
  const createSubmission = useCreateSubmission();
  
  const { data: submissionsData } = useSubmissions({ assessment_id: quizId });
  const isCompleted = (submissionsData?.pages?.flatMap(p => p.data) || []).length > 0;

  const [activeScreen, setActiveScreen] = useState<"intro" | "questions" | "results" | "review">("intro");
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Question lists
  const defaultQuestions: Question[] = [
    { type: "mcq", question: "What organelle converts light energy into sugar?", options: ["Nucleus", "Mitochondria", "Chloroplast", "Lysosome"], answer: "Chloroplast" },
    { type: "tf", question: "Eukaryotic cells contain membrane-bound organelles.", answer: "True" },
    { type: "fill", question: "Plant cell walls are composed of __________.", answer: "Cellulose" }
  ];

  const rawQuestions = quiz?.questions;
  const questions: Question[] = Array.isArray(rawQuestions) && rawQuestions.length > 0 ? rawQuestions : defaultQuestions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [aiReport, setAiReport] = useState("");

  const { score, earnedMarks, totalMarks } = React.useMemo(() => {
    if (!questions || questions.length === 0) return { score: 0, earnedMarks: 0, totalMarks: 0 };
    
    let eMarks = 0;
    let tMarks = 0;
    questions.forEach((q, idx) => {
      const qMarks = Number(q.marks) || 1;
      tMarks += qMarks;

      const userAns = String(answers[idx] || "").trim().toLowerCase();
      
      const raw = q.answer ?? (q as any).correctAnswer ?? (q as any).correct_answer ?? "";
      let ans = String(raw).trim();
      
      if (q.type === "mcq" || q.type === "multiple_choice" || q.type === "tf" || q.type === "true_false") {
        const options = q.options || (q as any).choices || (q.type.includes("tf") || q.type.includes("true") ? ["True", "False"] : []);
        const lower = ans.toLowerCase();
        if (/^[0-9]+$/.test(lower)) {
          const i = parseInt(lower, 10);
          if (options[i]) ans = options[i];
        } else if (/^[a-z]$/.test(lower)) {
          const i = lower.charCodeAt(0) - 97;
          if (options[i]) ans = options[i];
        }
      }
      
      const correctAns = ans.toLowerCase();
      if (userAns === correctAns && correctAns !== "") {
        eMarks += qMarks;
      }
    });

    return {
      score: tMarks > 0 ? Math.round((eMarks / tMarks) * 100) : 0,
      earnedMarks: eMarks,
      totalMarks: tMarks
    };
  }, [questions, answers]);

  useEffect(() => {
    if (quiz?.time_limit) {
      setTimeLeft(quiz.time_limit * 60);
    } else {
      setTimeLeft(15 * 60); // 15 mins default
    }
  }, [quiz]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const handleStartQuiz = () => {
    setActiveScreen("questions");
    setIsTimerActive(true);
  };

  const handleAnswerSelect = (val: string) => {
    setAnswers({ ...answers, [currentIdx]: val });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const triggerConfetti = () => {
    // Confetti logic...
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    for (let i = 0; i < 40; i++) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.width = `${Math.random() * 6 + 4}px`;
      el.style.height = `${Math.random() * 6 + 4}px`;
      el.style.backgroundColor = ["#0d9488", "#fbbf24", "#3b82f6", "#ef4444", "#8b5cf6"][Math.floor(Math.random() * 5)];
      el.style.left = `${Math.random() * 100}vw`;
      el.style.top = "-10px";
      el.style.borderRadius = "50%";
      el.style.opacity = (Math.random() * 0.7 + 0.3).toString();
      container.appendChild(el);

      const speed = Math.random() * 3 + 2;
      let top = -10;
      const interval = setInterval(() => {
        top += speed;
        el.style.top = `${top}px`;
        if (top > window.innerHeight) {
          clearInterval(interval);
          el.remove();
        }
      }, 16);
    }
    setTimeout(() => container.remove(), 4000);
  };

  const getResolvedCorrectAnswer = (q: Question) => {
    const raw = q.answer ?? q.correctAnswer ?? q.correct_answer ?? "";
    let ans = String(raw).trim();
    
    if (q.type === "mcq" || q.type === "multiple_choice" || q.type === "tf" || q.type === "true_false") {
      const options = q.options || q.choices || (q.type.includes("tf") || q.type.includes("true") ? ["True", "False"] : []);
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

  const handleSubmitQuiz = () => {
    setIsTimerActive(false);
    setActiveScreen("results");

    // Evaluate score (uses dynamic score from useMemo)
    const finalScorePercent = score;

    // Award XP and coins only if first attempt
    if (!isCompleted) {
      const xpEarned = earnedMarks * 100;
      const coinsEarned = earnedMarks * 15;
      addXp(xpEarned);
      addCoins(coinsEarned);
      logActivity(`Attempted Quiz: ${quiz?.title || "Class Quiz"}`, "quiz", finalScorePercent);

      // Save submission to database
      if (quizId && authUser) {
        createSubmission.mutate({
          student_id: authUser.id,
          assessment_type: "quiz",
          assessment_id: quizId,
          answers: Object.entries(answers).map(([idx, ans]) => ({
            question_index: parseInt(idx, 10),
            answer: ans
          })),
          score: finalScorePercent,
          status: "graded"
        });
      }
    } else {
      toast.info("Reattempt completed. Your original score was kept.");
    }

    // Confetti on success
    if (finalScorePercent >= 70) {
      triggerConfetti();
    }

    toast.success(`Quiz submitted! Earned ${earnedMarks}/${totalMarks} marks`);
  };

  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleRequestAiReport = () => {
    setIsAiLoading(true);
    toast.info("Laura AI is analyzing your performance...", { duration: 1500 });
    setTimeout(() => {
      setAiReport(
        `### Laura AI Quiz Performance Insights\n` +
        `*   **Strengths**: High accuracy on foundational concepts and structural identification.\n` +
        `*   **Identified Gaps**: Slightly struggled with complex multi-step processes.\n` +
        `*   **Next Steps**: Review the suggested lesson modules before the midterm.`
      );
      setIsAiLoading(false);
      toast.success("AI Performance Report generated!");
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-24 text-center">
        <Clock className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground">Preparing quiz sheet...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto text-center space-y-3 pt-24">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <p className="font-bold text-sm">Failed to load quiz</p>
        <Button onClick={() => router.back()} className="text-xs">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Intro Screen */}
      {activeScreen === "intro" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-12">
          <Card className="border-border/40 shadow-xl bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden text-center relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Trophy className="w-48 h-48 text-indigo-500 transform rotate-12" />
            </div>
            <CardHeader className="pb-4 relative z-10">
              <div className="w-20 h-20 bg-indigo-500/10 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <HelpCircle className="h-10 w-10" />
              </div>
              <CardTitle className="text-3xl font-extrabold font-heading text-foreground">{quiz?.title || "Class Quiz"}</CardTitle>
              <CardDescription className="text-sm font-medium mt-3 text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {quiz?.description || "Test your knowledge and earn XP! Make sure you are ready, the timer will start immediately."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8 relative z-10">
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="p-4 bg-muted/40 rounded-2xl flex flex-col items-center">
                  <Clock className="h-6 w-6 text-indigo-500 mb-2" />
                  <span className="font-bold text-sm text-foreground">{quiz?.time_limit || 15} mins</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-1">Time Limit</span>
                </div>
                <div className="p-4 bg-muted/40 rounded-2xl flex flex-col items-center">
                  <BarChart2 className="h-6 w-6 text-indigo-500 mb-2" />
                  <span className="font-bold text-sm text-foreground">{questions.length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-1">Questions</span>
                </div>
              </div>
              {isCompleted && (
                <div className="bg-emerald-500/10 text-emerald-600 p-3 rounded-xl text-sm font-bold flex items-center gap-2 justify-center max-w-sm mx-auto">
                  <CheckCircle className="w-5 h-5" /> You've already completed this quiz.
                </div>
              )}
              <Button size="lg" onClick={handleStartQuiz} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-12 h-14 text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
                {isCompleted ? "Reattempt Assessment" : "Start Assessment Now"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quiz Screen */}
      {activeScreen === "questions" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progress</p>
              <p className="font-extrabold text-lg text-foreground">Question {currentIdx + 1} <span className="text-muted-foreground text-sm">/ {questions.length}</span></p>
            </div>
            <div className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 ${timeLeft < 60 ? "bg-red-500/10 text-red-600 animate-pulse" : "bg-indigo-500/10 text-indigo-600"}`}>
              <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
            </div>
          </div>

          <div className="w-full bg-muted/40 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-border/40 shadow-lg bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardHeader className="pt-8 pb-6 px-8">
                  <CardTitle className="text-2xl font-bold leading-tight text-foreground">
                    {questions[currentIdx]?.question || (questions[currentIdx] as any)?.questionText || (questions[currentIdx] as any)?.text || "Question text missing"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  
                  {/* Options Rendering Logic */}
                  {(() => {
                    const qType = questions[currentIdx].type;
                    
                    if (qType === "mcq" || qType === "multiple_choice") {
                      const options = questions[currentIdx].options || (questions[currentIdx] as any).choices || [];
                      return (
                        <div className="space-y-3">
                          {options.map((opt: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => handleAnswerSelect(opt)}
                              className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all font-semibold ${answers[currentIdx] === opt ? "border-indigo-500 bg-indigo-500/5 text-indigo-700 shadow-md scale-[1.01]" : "border-border/60 hover:border-indigo-500/30 hover:bg-muted/30"}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      );
                    } else if (qType === "tf" || qType === "true_false") {
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          {["True", "False"].map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleAnswerSelect(opt)}
                              className={`p-6 text-center rounded-2xl border-2 transition-all font-bold text-lg ${answers[currentIdx] === opt ? "border-indigo-500 bg-indigo-500/5 text-indigo-700 shadow-md scale-[1.02]" : "border-border/60 hover:border-indigo-500/30 hover:bg-muted/30"}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <Input
                          placeholder="Type your precise answer here..."
                          className="h-14 text-base rounded-2xl bg-muted/20 border-border/60 focus:border-indigo-500"
                          value={answers[currentIdx] || ""}
                          onChange={(e) => handleAnswerSelect(e.target.value)}
                        />
                      );
                    }
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" className="rounded-xl h-10 px-6 font-bold border-border/60" onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} disabled={currentIdx === 0}>
              Previous
            </Button>
            {currentIdx === questions.length - 1 ? (
              <Button onClick={handleSubmitQuiz} className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white rounded-xl h-10 px-8 font-bold shadow-md">
                Submit Assessment
              </Button>
            ) : (
              <Button onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-8 font-bold shadow-md">
                Next Question
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results Screen */}
      {activeScreen === "results" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto mt-8">
          <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden text-center relative">
            <div className={`h-2 w-full ${score >= 70 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-amber-400 to-orange-500"}`} />
            <CardHeader className="pt-8 pb-4">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${score >= 70 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                {score >= 70 ? <Trophy className="h-12 w-12" /> : <Star className="h-12 w-12" />}
              </div>
              <CardTitle className="text-3xl font-extrabold font-heading text-foreground">
                {score >= 70 ? "Brilliant Work!" : "Good Effort!"}
              </CardTitle>
              <CardDescription className="text-sm font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                You have completed the assessment. Here is your final performance breakdown.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pb-8">
              <div className="flex justify-center items-end gap-2">
                <span className={`text-6xl font-extrabold tracking-tighter ${score >= 70 ? "text-emerald-500" : "text-amber-500"}`}>{score}</span>
                <span className="text-xl text-muted-foreground font-bold mb-2">%</span>
              </div>
              
              {/* Rewards */}
              <div className="flex justify-center gap-4">
                <div className="px-6 py-3 bg-teal-500/10 text-teal-700 rounded-2xl flex items-center gap-2 font-bold shadow-sm">
                  <Star className="h-5 w-5 fill-teal-500 text-teal-500" /> +{score > 0 ? (score / 100) * questions.length * 100 : 0} XP
                </div>
                <div className="px-6 py-3 bg-yellow-500/10 text-yellow-700 rounded-2xl flex items-center gap-2 font-bold shadow-sm">
                  <Award className="h-5 w-5 fill-yellow-500 text-yellow-500" /> +{score > 0 ? (score / 100) * questions.length * 15 : 0} Coins
                </div>
              </div>

              {/* AI Report Card */}
              {aiReport ? (
                <div className="text-left bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-12 h-12 text-indigo-500" />
                  </div>
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <p className="font-extrabold text-sm text-foreground">Laura AI Analysis</p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-medium relative z-10">{aiReport}</p>
                </div>
              ) : (
                <Button onClick={handleRequestAiReport} disabled={isAiLoading} className="w-full h-12 rounded-2xl border border-indigo-500/30 text-indigo-600 bg-indigo-500/5 hover:bg-indigo-500/10 font-bold gap-2 transition-all shadow-sm">
                  <Sparkles className={`h-4 w-4 ${isAiLoading ? "animate-spin" : ""}`} /> 
                  {isAiLoading ? "Generating Insights..." : "Generate Personalized AI Report"}
                </Button>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setActiveScreen("review")} className="text-xs font-bold gap-2 rounded-xl border-border/60 hover:bg-muted/40 h-10 px-6">
                  <RefreshCw className="h-4 w-4 text-indigo-500" /> Review Answers
                </Button>
                <Button onClick={() => router.push('/dashboard')} className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white text-xs font-bold gap-1.5 rounded-xl h-10 px-6 shadow-md">
                  <CheckCircle className="h-4 w-4" /> Finish Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Review Screen */}
      {activeScreen === "review" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto mt-8 space-y-6">
          <div className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-indigo-500" /> Assessment Review
            </h2>
            <Button variant="outline" onClick={() => setActiveScreen("results")} className="text-xs font-bold gap-1.5 rounded-xl h-9">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Results
            </Button>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAnsRaw = answers[idx] || "";
              const userAns = String(userAnsRaw).trim().toLowerCase();
              
              const resolvedCorrect = getResolvedCorrectAnswer(q);
              const correctAns = resolvedCorrect.toLowerCase();
              
              const isCorrect = userAns === correctAns && correctAns !== "";

              return (
                <Card key={idx} className={`border-2 overflow-hidden rounded-2xl ${isCorrect ? "border-emerald-500/30" : "border-red-500/30"}`}>
                  <div className={`h-1 w-full ${isCorrect ? "bg-emerald-500" : "bg-red-500"}`} />
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-bold text-sm text-foreground leading-relaxed">
                        <span className="text-muted-foreground mr-2">{idx + 1}.</span> 
                        {q.question || (q as any).questionText || (q as any).text || "Question"}
                      </p>
                      {isCorrect ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none shrink-0 font-bold">Correct</Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-600 border-none shrink-0 font-bold">Incorrect</Badge>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-muted/30">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Your Answer</p>
                        <p className={`text-sm font-semibold ${isCorrect ? "text-emerald-600" : "text-red-500"}`}>
                          {userAnsRaw || <span className="italic text-muted-foreground">Skipped</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Correct Answer</p>
                        <p className="text-sm font-semibold text-emerald-600">
                          {resolvedCorrect || <span className="italic opacity-50">Not specified</span>}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
