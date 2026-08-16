"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCreateClass } from "@/hooks/useSchool";
import { useAuthStore } from "@/store/useAuthStore";
import { PageHeader } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
  teacher_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateClassPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { mutate: create, isPending } = useCreateClass();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", teacher_id: "" },
  });

  function onSubmit(values: FormValues) {
    // institution_id must come from the logged-in admin's institution
    // In a real app this comes from user.institution_id stored in the JWT
    const institutionId = (user as any)?.institution_id ?? "";
    create(
      {
        institution_id: institutionId,
        name: values.name,
        description: values.description || undefined,
        teacher_id: values.teacher_id || undefined,
      },
      { onSuccess: () => router.push("/school/classes") }
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/school/classes">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="Create Class" subtitle="Add a new class to your institution" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl"><BookOpen className="h-5 w-5 text-blue-500" /></div>
            <div><CardTitle className="text-base">Class Details</CardTitle><CardDescription>Fill in the class information</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="e.g. Grade 7 — Science" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Class description..." className="resize-none" rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="teacher_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher ID</FormLabel>
                  <FormControl><Input placeholder="Enter teacher profile ID" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-2">
                <Link href="/school/classes"><Button variant="outline" type="button">Cancel</Button></Link>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Class
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
