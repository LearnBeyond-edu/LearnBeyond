"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  accentColor?: string;
  loading?: boolean;
}

export function StatCard({ title, value, subtitle, icon, trend, accentColor = "bg-primary/10 text-primary", loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-36" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`p-2 rounded-xl ${accentColor} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold font-heading tracking-tight">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {trend && (
        <div className={`text-xs mt-2 font-medium ${trend.value >= 0 ? "text-green-500" : "text-destructive"}`}>
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
}
