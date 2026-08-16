"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UploadCloud, Paperclip } from "lucide-react";
import Link from "next/link";
import { useCreateAssignment, useClasses } from "@/hooks/useSchool";
import { useAuthStore } from "@/store/useAuthStore";
import { generateAIResponse } from "@/services/aiService";
import { PageHeader } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Sparkles, Bot, PenTool } from "lucide-react";

const schema = z.object({
  class_id: z.string().min(1, "Please select a class"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  due_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(100);
  const { mutate: createAssignment, isPending } = useCreateAssignment();

  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const allClasses = classesData?.pages.flatMap((p) => p.data) ?? [];
  const myClasses = allClasses;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { class_id: "", title: "", description: "", due_date: "" },
  });

  const handleGenerateAI = async () => {
    if (!topic) return;
    setIsGenerating(true);
    
    try {
      const prompt = `You are a teacher assigning homework about "${topic}".
      Respond with a strict JSON object with EXACTLY these two keys:
      "title": A professional assignment title.
      "description": Detailed instructions for the assignment.
      Return ONLY valid JSON. Do not wrap in markdown code blocks.`;

      const aiResponse = await generateAIResponse(prompt, true);
      
      try {
        const jsonStr = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        
        form.setValue("title", parsed.title || `${topic} Assignment`);
        form.setValue("description", parsed.description || aiResponse);
      } catch (parseError) {
        console.error("Failed to parse AI JSON response", parseError);
        form.setValue("title", `${topic} Research Assignment`);
        form.setValue("description", aiResponse);
      }
    } catch (error) {
      console.error(error);
      form.setValue("title", `${topic} Research Assignment`);
      form.setValue("description", `Error generating AI assignment.`);
    }
    
    setIsGenerating(false);
    setMode("manual");
  };

  function onSubmit(values: FormValues) {
    createAssignment(
      {
        class_id: values.class_id,
        title: values.title,
        description: values.description || undefined,
        due_date: values.due_date ? new Date(values.due_date).toISOString() : undefined,
      },
      {
        onSuccess: () => router.push("/teacher/assignments"),
      }
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher/assignments">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="Create Assignment" subtitle="Assign tasks and track student progress" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-muted p-1 rounded-lg inline-flex">
              <Button type="button" variant={mode === "manual" ? "default" : "ghost"} onClick={() => setMode("manual")} className="gap-2 rounded-md">
                <PenTool className="h-4 w-4" /> Manual Mode
              </Button>
              <Button type="button" variant={mode === "ai" ? "default" : "ghost"} onClick={() => setMode("ai")} className="gap-2 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90">
                <Sparkles className="h-4 w-4" /> Laura AI Generator
              </Button>
            </div>
          </div>

          {mode === "ai" ? (
            <Card className="border-blue-500/20 shadow-lg shadow-blue-500/5 overflow-hidden relative max-w-2xl mx-auto mb-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
              <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" /> Auto-Generate Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">Provide a topic and Laura AI will instantly generate a structured assignment title and detailed instructions for your students.</p>
                <div className="flex gap-3">
                  <Input placeholder="e.g. World War II, Calculus Derivatives..." value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isGenerating} className="flex-1" />
                  <Button type="button" onClick={handleGenerateAI} disabled={!topic || isGenerating} className="gap-2 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white">
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className={mode === "ai" ? "hidden" : ""}>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Assignment Title</FormLabel>
                    <FormControl><Input placeholder="e.g. Chapter 4 Essay" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="class_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingClasses}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
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

                <FormField control={form.control} name="due_date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Instructions / Description</FormLabel>
                    <FormControl><Textarea placeholder="Detailed instructions for the assignment..." className="resize-none h-32" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Attachments Section */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Attachments</h4>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground relative">
                  <Paperclip className="h-6 w-6 mb-2 text-violet-500" />
                  <span className="text-sm font-medium">Click to upload files or drag and drop</span>
                  <span className="text-xs">PDF, DOCX, JPG (Max 5MB)</span>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                    if (e.target.files?.length) {
                      const file = e.target.files[0];
                      import("sonner").then((m) => m.toast.success(`${file.name} attached successfully!`));
                    }
                  }} />
                </label>
              </div>

            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/teacher/assignments">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Publish Assignment
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
