"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("System Boundary Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-xs text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md space-y-6 bg-card border border-border/60 p-8 rounded-3xl shadow-xl flex flex-col items-center"
      >
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full animate-bounce">
          <AlertCircle className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold font-heading text-foreground font-heading">Something went wrong!</h1>
          <p className="text-muted-foreground leading-relaxed">
            {error.message || "The application encountered an unexpected error while rendering this page."}
          </p>
          {error.digest && (
            <p className="text-[10px] bg-muted border p-1.5 rounded-lg text-muted-foreground font-mono truncate max-w-xs mt-2 mx-auto">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1 gap-2 rounded-xl h-9 font-semibold" onClick={() => reset()}>
            <RefreshCw className="h-4 w-4" /> Retry Query
          </Button>
          <Button className="flex-1 gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 font-semibold" onClick={() => router.push("/dashboard")}>
            <Home className="h-4 w-4" /> Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
