"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, user } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      const roleStr = String(user.role || (user as any).role_name || "").toLowerCase().trim();
      if (roleStr.includes('platform') || roleStr === 'super_admin' || roleStr === 'admin' || roleStr === 'platform_admin') {
        router.push("/admin");
      } else if (roleStr.includes('institution') || roleStr.includes('school') || roleStr === 'school_admin') {
        router.push("/school");
      } else if (roleStr.includes('teacher') || roleStr.includes('staff')) {
        router.push("/teacher");
      } else if (roleStr.includes('parent')) {
        router.push("/parent");
      } else if (roleStr.includes('therapist')) {
        router.push("/therapist");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      const user = data.data.user;
      const accessToken = data.data.accessToken;
      const refreshToken = data.data.refreshToken;
      
      const roleStr = String(user.role || user.role_name || "").toLowerCase().trim();
      let canonicalRole: "Platform Admin" | "Institution Admin" | "Teacher" | "Student" | "Parent" | "Therapist" = "Student";
      if (roleStr.includes('platform') || roleStr === 'super_admin' || roleStr === 'admin' || roleStr === 'platform_admin') {
        canonicalRole = "Platform Admin";
      } else if (roleStr.includes('institution') || roleStr.includes('school') || roleStr === 'school_admin') {
        canonicalRole = "Institution Admin";
      } else if (roleStr.includes('teacher') || roleStr.includes('staff')) {
        canonicalRole = "Teacher";
      } else if (roleStr.includes('parent')) {
        canonicalRole = "Parent";
      } else if (roleStr.includes('therapist')) {
        canonicalRole = "Therapist";
      } else {
        canonicalRole = "Student";
      }

      user.role = canonicalRole;
      user.role_name = canonicalRole;
      if (user.first_name && !user.firstName) user.firstName = user.first_name;
      if (user.last_name !== undefined && user.lastName === undefined) user.lastName = user.last_name;
      if (user.institution_id && !user.institutionId) user.institutionId = user.institution_id;
      
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName || canonicalRole}!`);
      
      // Strict role-based routing
      if (canonicalRole === 'Platform Admin') {
        router.push("/admin");
      } else if (canonicalRole === 'Institution Admin') {
        router.push("/school");
      } else if (canonicalRole === 'Teacher') {
        router.push("/teacher");
      } else if (canonicalRole === 'Parent') {
        router.push("/parent");
      } else if (canonicalRole === 'Therapist') {
        router.push("/therapist");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to login. Please try again.");
    },
  });

  function onSubmit(values: LoginFormValues) {
    login(values);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold font-heading tracking-tight">
            Sign in to LearnBeyond
          </CardTitle>
          <CardDescription>
            Enter your email and password below to log in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form 
              method="POST" 
              action="#" 
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(onSubmit)(e);
              }} 
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>

          <div className="mt-5 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
