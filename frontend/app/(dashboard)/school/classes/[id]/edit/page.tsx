"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { useClass, useUpdateClass } from "@/hooks/useSchool";
import { PageHeader, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
  teacher_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditClassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: cls, isLoading, isError } = useClass(id);
  const { mutate: update, isPending } = useUpdateClass();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", teacher_id: "" },
  });

  useEffect(() => {
    if (cls) {
      form.reset({
        name: cls.name,
        description: cls.description ?? "",
        teacher_id: cls.teacher_id ?? "",
      });
    }
  }, [cls, form]);

  function onSubmit(values: FormValues) {
    update(
      { id, payload: { name: values.name, description: values.description || undefined, teacher_id: values.teacher_id || undefined } },
      { onSuccess: () => router.push(`/school/classes/${id}`) }
    );
  }

  if (isError) return <ErrorState error="Class not found" />;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/school/classes/${id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="Edit Class" subtitle={cls?.name ?? "Loading..."} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl"><BookOpen className="h-5 w-5 text-blue-500" /></div>
            <div><CardTitle className="text-base">Update Class</CardTitle><CardDescription>Modify class details and save</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea className="resize-none" rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="teacher_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher ID</FormLabel>
                    <FormControl><Input placeholder="Teacher profile ID" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end gap-3 pt-2">
                  <Link href={`/school/classes/${id}`}><Button variant="outline" type="button">Cancel</Button></Link>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
