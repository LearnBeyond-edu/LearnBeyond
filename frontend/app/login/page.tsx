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
      const roleStr = String(user.role).toLowerCase();
      if (roleStr.includes('platform admin') || roleStr === 'super_admin') router.push("/admin");
      else if (roleStr.includes('institution admin') || roleStr.includes('school admin') || roleStr === 'admin' || roleStr === 'school') router.push("/school");
      else if (roleStr.includes('teacher')) router.push("/teacher");
      else if (roleStr.includes('parent')) router.push("/parent");
      else if (roleStr.includes('therapist')) router.push("/therapist");
      else router.push("/dashboard");
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
      // Assuming data structure based on typical node backends: { status: 'success', data: { user, accessToken } }
      const user = data.data.user;
      const accessToken = data.data.accessToken;
      const refreshToken = data.data.refreshToken;
      
      // Ensure backend's snake_case properties are mapped to frontend's expected properties
      if (user.role_name && !user.role) user.role = user.role_name;
      if (user.first_name && !user.firstName) user.firstName = user.first_name;
      if (user.last_name !== undefined && user.lastName === undefined) user.lastName = user.last_name;
      if (user.institution_id && !user.institutionId) user.institutionId = user.institution_id;
      
      setAuth(user, accessToken, refreshToken);
      toast.success("Welcome back!");
      
      // Role-based routing
      const roleStr = String(user.role).toLowerCase();
      if (roleStr.includes('platform admin') || roleStr === 'super_admin') {
        router.push("/admin");
      } else if (roleStr.includes('institution admin') || roleStr.includes('school admin') || roleStr === 'admin' || roleStr === 'school') {
        router.push("/school");
      } else if (roleStr.includes('teacher')) {
        router.push("/teacher");
      } else if (roleStr.includes('parent')) {
        router.push("/parent");
      } else if (roleStr.includes('therapist')) {
        router.push("/therapist");
      } else {
        router.push("/dashboard"); // Student or default
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
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
