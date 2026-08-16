"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function OfflinePage() {
  const router = useRouter();
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOnline(navigator.onLine);
      const handleOnline = () => {
        setOnline(true);
        toast.success("Network connection restored! Re-route home.");
        router.push("/dashboard");
      };
      window.addEventListener("online", handleOnline);
      return () => window.removeEventListener("online", handleOnline);
    }
  }, [router]);

  const handleCheckConnection = () => {
    if (navigator.onLine) {
      toast.success("Online! Redirecting...");
      router.push("/dashboard");
    } else {
      toast.error("Still offline. Please check your internet adapter settings.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-xs text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md space-y-6 bg-card border border-border/60 p-8 rounded-3xl shadow-xl flex flex-col items-center"
      >
        <div className="p-4 bg-muted/60 text-muted-foreground rounded-full animate-pulse">
          <WifiOff className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold font-heading text-foreground font-heading">Connection Lost</h1>
          <p className="text-muted-foreground leading-relaxed">
            You are currently offline. Check your router signal indicators or local network configuration.
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1 gap-2 rounded-xl h-9 font-semibold" onClick={handleCheckConnection}>
            <RefreshCw className="h-4 w-4" /> Check Adapter
          </Button>
          <Button className="flex-1 gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 font-semibold" onClick={() => router.push("/dashboard")}>
            <Home className="h-4 w-4" /> Go Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
