"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, UploadCloud, Video, FileText, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useLesson, useUpdateLesson, useClasses } from "@/hooks/useSchool";
import { useAuthStore } from "@/store/useAuthStore";
import { PageHeader, ErrorState, TableSkeleton } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { saveAttachment, getAttachments, Attachment } from "@/lib/fileStorage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const schema = z.object({
  class_id: z.string().min(1, "Please select a class"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  content: z.string().optional(),
  scheduled_time: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user } = useAuthStore();
  
  const { data: lesson, isLoading: isLessonLoading, isError, refetch } = useLesson(id);
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(100);
  const { mutate: updateLesson, isPending } = useUpdateLesson();

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const allClasses = classesData?.pages.flatMap((p) => p.data) ?? [];
  const myClasses = allClasses.filter((c) => c.teacher_id === user?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { class_id: "", title: "", description: "", content: "", scheduled_time: "" },
  });

  useEffect(() => {
    if (lesson) {
      form.reset({
        class_id: lesson.class_id,
        title: lesson.title,
        description: lesson.description || "",
        content: lesson.content || "",
        scheduled_time: lesson.scheduled_time ? new Date(lesson.scheduled_time).toISOString().slice(0, 16) : "",
      });
    }
  }, [lesson, form]);

  useEffect(() => {
    if (id) {
      getAttachments(id).then(setAttachments).catch(console.error);
    }
  }, [id]);

  if (isError) return <ErrorState error="Failed to load lesson" onRetry={refetch} />;
  if (isLessonLoading) return <TableSkeleton rows={8} cols={1} />;

  function onSubmit(values: FormValues) {
    updateLesson(
      {
        id,
        payload: {
          title: values.title,
          description: values.description || undefined,
          content: values.content || undefined,
          scheduled_time: values.scheduled_time ? new Date(values.scheduled_time).toISOString() : undefined,
        },
      },
      {
        onSuccess: () => router.push("/teacher/lessons"),
      }
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher/lessons">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="Edit Lesson" subtitle="Update lesson content and schedule" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Title</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl><Textarea className="resize-none h-20" {...field} /></FormControl>
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
                            <Textarea className="min-h-[250px] font-mono text-sm" {...field} />
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
                              await saveAttachment(id, newAttachment);
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
                      <FormLabel>Target Class (Read-only)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={true}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {myClasses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
                    Save Changes
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
