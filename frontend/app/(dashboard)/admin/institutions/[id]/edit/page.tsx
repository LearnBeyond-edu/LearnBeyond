"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { useInstitution, useUpdateInstitution } from "@/hooks/useInstitutions";
import { PageHeader, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact_email: z.string().email("Invalid email").or(z.literal("")).optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditInstitutionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: institution, isLoading, isError } = useInstitution(id);
  const { mutate: update, isPending } = useUpdateInstitution();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", contact_email: "", contact_phone: "", address: "" },
  });

  // Pre-populate form once data loads
  useEffect(() => {
    if (institution) {
      form.reset({
        name: institution.name ?? "",
        contact_email: institution.email ?? "",
        contact_phone: institution.phone ?? "",
        address: institution.address ?? "",
      });
    }
  }, [institution, form]);

  function onSubmit(values: FormValues) {
    update(
      { id, payload: { name: values.name, contact_email: values.contact_email || undefined, contact_phone: values.contact_phone || undefined, address: values.address || undefined } },
      { onSuccess: () => router.push(`/admin/institutions/${id}`) }
    );
  }

  if (isError) return <ErrorState error="Institution not found" />;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/admin/institutions/${id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title="Edit Institution" subtitle={institution?.name ?? "Loading..."} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Update Details</CardTitle>
              <CardDescription>Make changes and save to update the institution</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="contact_email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contact_phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex justify-end gap-3 pt-2">
                  <Link href={`/admin/institutions/${id}`}>
                    <Button variant="outline" type="button">Cancel</Button>
                  </Link>
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
