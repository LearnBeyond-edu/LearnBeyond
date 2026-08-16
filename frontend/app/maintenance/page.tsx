"use client";

import React from "react";
import { Wrench, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MaintenancePage() {
  const handleReload = () => {
    toast.info("Checking server status...");
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-xs text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md space-y-6 bg-card border border-border/60 p-8 rounded-3xl shadow-xl flex flex-col items-center"
      >
        <div className="p-4 bg-teal-500/10 text-teal-600 rounded-full animate-[spin_4s_linear_infinite]">
          <Wrench className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold font-heading text-foreground font-heading">Under Scheduled Maintenance</h1>
          <p className="text-muted-foreground leading-relaxed">
            The LearnBeyond portal is undergoing standard data migration cycles. We will return online shortly.
          </p>
        </div>

        <Button className="w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 font-semibold" onClick={handleReload}>
          <RefreshCw className="h-4 w-4" /> Check Status
        </Button>
      </motion.div>
    </div>
  );
}
