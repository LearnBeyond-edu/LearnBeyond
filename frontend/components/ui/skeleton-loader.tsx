"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-muted/60 dark:bg-muted/30 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-border/60 rounded-3xl p-5 space-y-4 bg-card shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-border/40">
        <Skeleton className="h-7 w-20 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-3 border-b border-border/40 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-3.5 flex-1 ${c === 0 ? "w-3/4" : ""}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="border border-border/60 rounded-3xl p-5 space-y-4 bg-card shadow-sm h-80 flex flex-col justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="flex items-end gap-3 flex-1 px-2 pt-4">
        {[60, 40, 80, 50, 90, 70, 45, 85, 30, 95].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            className="flex-1 bg-muted/60 dark:bg-muted/30 rounded-t-lg"
            transition={{ duration: 0.5, delay: i * 0.05 }}
          />
        ))}
      </div>
      <div className="flex justify-between border-t border-border/40 pt-3 text-[10px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-10" />
        ))}
      </div>
    </div>
  );
}

export function AiStreamingLoader() {
  return (
    <div className="flex gap-3 p-4 rounded-3xl bg-muted/20 border border-border/40 max-w-2xl">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-xs animate-pulse">✨</span>
      </div>
      <div className="space-y-2 flex-1 pt-1">
        <div className="flex gap-1.5 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Laura AI co-pilot</span>
          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-ping" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
}
