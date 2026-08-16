"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCreateInstitution } from "@/hooks/useInstitutions";
import { PageHeader } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact_email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  contact_phone: z.string().min(6, "Enter a valid phone number").or(z.literal("")).optional(),
  address: z.string().optional(),
  password: z.string().min(6, "Admin password must be at least 6 characters"),
  subscription_plan: z.string().min(1, "Please select a plan"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateInstitutionPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateInstitution();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", contact_email: "", contact_phone: "", address: "", password: "", subscription_plan: "Starter" },
  });

  function onSubmit(values: FormValues) {
    create(
      { 
        name: values.name, 
        contact_email: values.contact_email || undefined, 
        contact_phone: values.contact_phone || undefined, 
        address: values.address || undefined,
        password: values.password,
        subscription_plan: values.subscription_plan,
        subscription_status: 'active'
      },
      { onSuccess: () => router.push("/admin/institutions") }
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/institutions">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title="Create Institution" subtitle="Add a new institution to the platform" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Institution Details</CardTitle>
              <CardDescription>Fill in the details for the new institution</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Springfield Academy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@school.edu" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555 000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="742 Evergreen Terrace, Springfield" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Admin Password <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subscription_plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Plan <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Starter">Starter ($49/mo)</SelectItem>
                          <SelectItem value="Professional">Professional ($149/mo)</SelectItem>
                          <SelectItem value="Enterprise">Enterprise (Custom)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Link href="/admin/institutions">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Institution
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
