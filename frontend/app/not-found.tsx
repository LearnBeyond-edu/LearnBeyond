"use client";

import React from "react";
import { HelpCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-xs text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md space-y-6 bg-card border border-border/60 p-8 rounded-3xl shadow-xl flex flex-col items-center"
      >
        <div className="p-4 bg-yellow-500/10 text-yellow-600 rounded-full animate-pulse">
          <HelpCircle className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold font-heading text-foreground font-heading">Page Not Found (404)</h1>
          <p className="text-muted-foreground leading-relaxed">
            The workspace or resource link you followed does not exist or has been relocated to another route directory.
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1 gap-2 rounded-xl h-9 font-semibold" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button className="flex-1 gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 font-semibold" onClick={() => router.push("/dashboard")}>
            <Home className="h-4 w-4" /> Go Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
