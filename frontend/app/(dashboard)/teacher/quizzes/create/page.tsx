"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Plus, Trash2, CheckCircle2, HelpCircle, Sparkles, Bot, PenTool } from "lucide-react";
import Link from "next/link";
import { useCreateQuiz, useClasses } from "@/hooks/useSchool";
import { useAuthStore } from "@/store/useAuthStore";
import { generateAIResponse } from "@/services/aiService";
import { PageHeader } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Question {
  id: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  questionText: string;
  options: string[];
  correctAnswer: string;
}

const schema = z.object({
  class_id: z.string().min(1, "Please select a class"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  due_date: z.string().optional(),
  time_limit: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateQuizPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(100);
  const { mutate: createQuiz, isPending } = useCreateQuiz();

  const allClasses = classesData?.pages.flatMap((p) => p.data) ?? [];
  const myClasses = allClasses;

  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      type: "multiple_choice",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    },
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { class_id: "", title: "", description: "", due_date: "", time_limit: "" },
  });

  const handleGenerateAI = async () => {
    if (!topic) return;
    setIsGenerating(true);
    
    try {
      const prompt = `You are a teacher writing a quiz about "${topic}".
      Generate a JSON array of exactly ${questionCount} objects. Do not wrap it in markdown block quotes, just output the raw JSON array.
      Format:
      [
        {
          "type": "multiple_choice",
          "questionText": "Question here",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "B"
        }
      ]
      Include a mix of true/false and multiple_choice questions.`;

      let aiResponse = await generateAIResponse(prompt, true);
      // Clean markdown formatting if present
      aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedQuestions = JSON.parse(aiResponse);
      
      form.setValue("title", `${topic} Assessment`);
      form.setValue("time_limit", "30");
      
      const formattedQuestions = generatedQuestions.map((q: any, i: number) => ({
        id: (Date.now() + i).toString(),
        type: q.type || "multiple_choice",
        questionText: q.questionText || "Generated Question",
        options: q.options || ["A", "B", "C", "D"],
        correctAnswer: q.correctAnswer || "A"
      }));
      
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error(error);
      form.setValue("title", `${topic} Assessment`);
      setQuestions([
        {
          id: Date.now().toString(),
          type: "multiple_choice",
          questionText: `Error generating questions for ${topic}. Please try again.`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option B",
        }
      ]);
    }
    
    setIsGenerating(false);
    setMode("manual");
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "multiple_choice",
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, questionText: text } : q))
    );
  };

  const updateQuestionType = (index: number, type: Question["type"]) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? {
              ...q,
              type,
              options: type === "multiple_choice" ? ["", "", "", ""] : type === "true_false" ? ["True", "False"] : [],
              correctAnswer: "",
            }
          : q
      )
    );
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) => (oi === oIndex ? text : opt)),
            }
          : q
      )
    );
  };

  const updateCorrectAnswer = (qIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, correctAnswer: value } : q))
    );
  };

  function onSubmit(values: FormValues) {
    createQuiz(
      {
        class_id: values.class_id,
        title: values.title,
        description: values.description || undefined,
        due_date: values.due_date ? new Date(values.due_date).toISOString() : undefined,
        time_limit: values.time_limit ? parseInt(values.time_limit, 10) : undefined,
        questions: questions,
      },
      {
        onSuccess: () => router.push("/teacher/quizzes"),
      }
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher/quizzes">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="Create Quiz" subtitle="Create interactive quizzes to assess students" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="bg-muted p-1 rounded-lg inline-flex">
              <Button type="button" variant={mode === "manual" ? "default" : "ghost"} onClick={() => setMode("manual")} className="gap-2 rounded-md">
                <PenTool className="h-4 w-4" /> Manual Mode
              </Button>
              <Button type="button" variant={mode === "ai" ? "default" : "ghost"} onClick={() => setMode("ai")} className="gap-2 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90">
                <Sparkles className="h-4 w-4" /> Laura AI Generator
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">

              {mode === "ai" ? (
                <Card className="border-orange-500/20 shadow-lg shadow-orange-500/5 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                  <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="h-5 w-5 text-orange-500" /> Auto-Generate Quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm text-muted-foreground">Provide a topic and Laura AI will instantly draft a set of questions (multiple choice, true/false) complete with correct answers and options.</p>
                    <div className="flex gap-3">
                      <Input placeholder="e.g. Basic Algebra, History of Rome..." value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isGenerating} className="flex-1" />
                      <Input type="number" min="1" max="20" placeholder="Count" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)} disabled={isGenerating} className="w-20" />
                      <Button type="button" onClick={handleGenerateAI} disabled={!topic || isGenerating} className="gap-2 min-w-[140px] bg-orange-600 hover:bg-orange-700 text-white">
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {isGenerating ? "Generating..." : "Generate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold">Quiz Questions</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-1">
                    <Plus className="h-4 w-4" /> Add Question
                  </Button>
                </div>

                {questions.map((q, qIndex) => (
                  <Card key={q.id} className="relative overflow-hidden border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-orange-500" /> Question {qIndex + 1}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Select value={q.type} onValueChange={(val: any) => updateQuestionType(qIndex, val)}>
                          <SelectTrigger className="h-8 w-[140px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice" className="text-xs">Multiple Choice</SelectItem>
                            <SelectItem value="true_false" className="text-xs">True / False</SelectItem>
                            <SelectItem value="short_answer" className="text-xs">Short Answer</SelectItem>
                          </SelectContent>
                        </Select>
                        {questions.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeQuestion(qIndex)}>
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Question Text</label>
                        <Input placeholder="What is the capital of France?" value={q.questionText} onChange={(e) => updateQuestionText(qIndex, e.target.value)} />
                      </div>

                      {q.type === "multiple_choice" && (
                        <div className="space-y-3 pt-2">
                          <label className="text-xs font-semibold text-muted-foreground">Options</label>
                          <div className="grid grid-cols-2 gap-3">
                            {q.options.map((opt, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase">{String.fromCharCode(65 + oIndex)}</span>
                                <Input placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.type !== "short_answer" && (
                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-semibold text-muted-foreground">Select Correct Answer</label>
                          <div className="flex flex-wrap gap-2">
                            {q.type === "multiple_choice" ? (
                              q.options.map((opt, oIndex) => (
                                <Button
                                  key={oIndex}
                                  type="button"
                                  variant={q.correctAnswer === opt && opt ? "default" : "outline"}
                                  className={`text-xs h-8 ${q.correctAnswer === opt && opt ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-none' : ''}`}
                                  disabled={!opt}
                                  onClick={() => updateCorrectAnswer(qIndex, opt)}
                                >
                                  {String.fromCharCode(65 + oIndex)}: {opt || "(empty)"}
                                </Button>
                              ))
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant={q.correctAnswer === "True" ? "default" : "outline"}
                                  className={`text-xs h-8 ${q.correctAnswer === "True" ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-none' : ''}`}
                                  onClick={() => updateCorrectAnswer(qIndex, "True")}
                                >
                                  True
                                </Button>
                                <Button
                                  type="button"
                                  variant={q.correctAnswer === "False" ? "default" : "outline"}
                                  className={`text-xs h-8 ${q.correctAnswer === "False" ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-none' : ''}`}
                                  onClick={() => updateCorrectAnswer(qIndex, "False")}
                                >
                                  False
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {q.type === "short_answer" && (
                        <div className="space-y-1 pt-2">
                          <label className="text-xs font-semibold text-muted-foreground">Target Correct Answer Keyphrase (Optional)</label>
                          <Input placeholder="e.g. photosynthesis" value={q.correctAnswer} onChange={(e) => updateCorrectAnswer(qIndex, e.target.value)} />
                        </div>
                      )}

                    </CardContent>
                  </Card>
                ))}
              </div>
              )}

            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Quiz Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="class_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingClasses}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {myClasses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name || `Class ${c.grade || 'N/A'} - Section ${c.section || 'N/A'}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiz Title</FormLabel>
                      <FormControl><Input placeholder="e.g. Science Midterm" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="time_limit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Limit (Minutes)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 45" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="due_date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 border-none text-white gap-1.5" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Create Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
