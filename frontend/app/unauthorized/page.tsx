"use client";

import React from "react";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-xs text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md space-y-6 bg-card border border-border/60 p-8 rounded-3xl shadow-xl flex flex-col items-center"
      >
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full animate-bounce">
          <ShieldAlert className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold font-heading text-foreground">Access Denied</h1>
          <p className="text-muted-foreground leading-relaxed">
            You do not have the credentials required to view this portal workspace. Please check your account role setup.
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1 gap-2 rounded-xl h-9 font-semibold" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button className="flex-1 gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 font-semibold" onClick={() => router.push("/dashboard")}>
            <Home className="h-4 w-4" /> Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
