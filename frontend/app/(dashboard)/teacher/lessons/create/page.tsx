"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UploadCloud, Video, FileText, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCreateLesson, useClasses } from "@/hooks/useSchool";
import { useAuthStore } from "@/store/useAuthStore";
import { generateAIResponse } from "@/services/aiService";
import { PageHeader } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { saveAttachment, moveTempAttachments, getAttachments, Attachment } from "@/lib/fileStorage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Sparkles, Bot, PenTool } from "lucide-react";

const schema = z.object({
  class_id: z.string().min(1, "Please select a class"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  content: z.string().optional(),
  scheduled_time: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateLessonPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(100);
  const { mutate: createLesson, isPending } = useCreateLesson();

  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const allClasses = classesData?.pages.flatMap((p) => p.data) ?? [];
  const myClasses = allClasses;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { class_id: "", title: "", description: "", content: "", scheduled_time: "" },
  });

  useEffect(() => {
    getAttachments("temp").then(setAttachments).catch(console.error);
  }, []);

  const handleGenerateAI = async () => {
    if (!topic) return;
    setIsGenerating(true);
    
    try {
      const prompt = `You are an expert teacher creating a lesson plan about "${topic}". 
      Respond with a strict JSON object with EXACTLY these three keys:
      "title": A catchy, professional title for the lesson.
      "description": A short 1-2 sentence description suitable for middle-schoolers.
      "content": The full lesson content formatted in Markdown, including Learning Objectives, Main Concepts, and an Assignment/Activity.
      Return ONLY valid JSON. Do not wrap in markdown code blocks.`;

      const aiResponse = await generateAIResponse(prompt, true); // True defaults to Groq for speed
      
      try {
        // Strip out any markdown code blocks if the AI still included them
        const jsonStr = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        let parsed;
        try {
          parsed = JSON.parse(jsonStr);
        } catch (e) {
          // Fallback regex parser for invalid JSON string literal control characters (literal newlines)
          const titleMatch = jsonStr.match(/"title"\s*:\s*"([^"]*)"/i);
          const descMatch = jsonStr.match(/"description"\s*:\s*"([^"]*)"/i);
          const contentMatch = jsonStr.match(/"content"\s*:\s*"([\s\S]*?)"\s*}/i);
          
          if (!titleMatch && !contentMatch) throw e;
          
          parsed = {
            title: titleMatch ? titleMatch[1] : "",
            description: descMatch ? descMatch[1] : "",
            content: contentMatch ? contentMatch[1] : ""
          };
        }
        
        form.setValue("title", parsed.title || `Exploring ${topic}`);
        form.setValue("description", parsed.description || `An introductory lesson about ${topic}.`);
        form.setValue("content", parsed.content || aiResponse);
      } catch (parseError) {
        // Fallback if AI formatting fails completely
        form.setValue("title", `Exploring ${topic}`);
        form.setValue("description", `An introductory lesson about ${topic} tailored for middle-school comprehension.`);
        form.setValue("content", aiResponse);
      }
    } catch (error) {
      console.error(error);
      form.setValue("title", `Exploring ${topic}`);
      form.setValue("description", `Error generating AI content.`);
    }
    
    setIsGenerating(false);
    setMode("manual"); // Switch back to manual so they can review/edit
  };

  function onSubmit(values: FormValues) {
    createLesson(
      {
        class_id: values.class_id,
        title: values.title,
        description: values.description || undefined,
        content: values.content || undefined,
        scheduled_time: values.scheduled_time ? new Date(values.scheduled_time).toISOString() : undefined,
      },
      {
        onSuccess: async (data: any) => {
          if (data?.id) {
            await moveTempAttachments(data.id);
          }
          router.push("/teacher/lessons");
        },
      }
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher/lessons">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="Create Lesson" subtitle="Design a new learning experience for your class" />
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

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              
              {mode === "ai" ? (
                <Card className="border-blue-500/20 shadow-lg shadow-blue-500/5 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
                  <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="h-5 w-5 text-blue-500" /> Let Laura AI Write For You
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm text-muted-foreground">Provide a topic and our AI assistant will generate a comprehensive title, description, and lesson content formatted in markdown. You can review and edit it before sending it to your students.</p>
                    <div className="flex gap-3">
                      <Input placeholder="e.g. The Solar System, Photosynthesis, Fractions..." value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isGenerating} className="flex-1" />
                      <Button type="button" onClick={handleGenerateAI} disabled={!topic || isGenerating} className="gap-2 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white">
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {isGenerating ? "Generating..." : "Generate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Title</FormLabel>
                      <FormControl><Input placeholder="e.g. Introduction to Cellular Biology" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl><Textarea placeholder="Briefly describe what this lesson covers..." className="resize-none h-20" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Content / Objectives</FormLabel>
                      <Tabs defaultValue="write" className="w-full mt-2">
                        <TabsList className="grid w-[200px] grid-cols-2 mb-2">
                          <TabsTrigger value="write">Write</TabsTrigger>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="write" className="mt-0">
                          <FormControl>
                            <Textarea placeholder="Write the main lesson content, objectives, or instructions here. Supports markdown." className="min-h-[250px] font-mono text-sm" {...field} />
                          </FormControl>
                        </TabsContent>
                        <TabsContent value="preview" className="mt-0">
                          <div className="min-h-[250px] p-4 rounded-md border bg-muted/20 text-sm whitespace-pre-wrap">
                            {field.value || "Nothing to preview yet."}
                          </div>
                        </TabsContent>
                      </Tabs>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
              )}

              {/* Mock Upload Area */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold mb-4">Learning Materials</h3>
                  
                  {attachments.length > 0 && (
                    <div className="flex flex-col gap-2 mb-6">
                      {attachments.map((a: Attachment, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 text-sm border rounded-lg bg-muted/20">
                          <span className="flex items-center gap-3 font-medium">
                            {a.type === 'video' && <Video className="h-4 w-4 text-red-500" />}
                            {a.type === 'pdf' && <FileText className="h-4 w-4 text-blue-500" />}
                            {a.type === 'image' && <ImageIcon className="h-4 w-4 text-emerald-500" />}
                            {a.label}
                          </span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{a.size}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <Video className="h-5 w-5 mb-2 text-red-500" />, label: "Upload Video", accept: "video/*", type: "video" },
                      { icon: <FileText className="h-5 w-5 mb-2 text-blue-500" />, label: "Upload PDF", accept: ".pdf", type: "pdf" },
                      { icon: <ImageIcon className="h-5 w-5 mb-2 text-emerald-500" />, label: "Upload Image", accept: "image/*", type: "image" },
                    ].map((btn, i) => (
                      <label key={i} className="flex flex-col items-center justify-center p-4 border border-dashed rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer relative overflow-hidden group">
                        {btn.icon}
                        <span className="text-xs font-medium">{btn.label}</span>
                        <input type="file" accept={btn.accept} className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                          if (e.target.files?.length) {
                            const file = e.target.files[0];
                            try {
                              const newAttachment = {
                                label: file.name,
                                type: btn.type as "video" | "pdf" | "image",
                                size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                                file: file
                              };
                              await saveAttachment("temp", newAttachment);
                              setAttachments((prev: Attachment[]) => [...prev, newAttachment]);
                              toast.success(`${file.name} attached successfully!`);
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to attach file.");
                            }
                          }
                        }} />
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <FormField control={form.control} name="class_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Class</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingClasses}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
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

                  <FormField control={form.control} name="scheduled_time" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Publish Lesson
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
