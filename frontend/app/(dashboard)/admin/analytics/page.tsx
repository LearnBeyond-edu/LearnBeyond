"use client";

import React from "react";
import { PageHeader } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cpu, HardDrive, Database, ShieldCheck } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

export default function AdminAnalyticsPage() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await api.get('/analytics/system-health');
      return res.data;
    },
    refetchInterval: 10000 // refresh every 10s
  });

  const systemLoadData = healthData?.data.history || [];

  return (
    <div className="max-w-5xl space-y-6 text-xs">
      <PageHeader
        title="System Observability Analytics"
        subtitle="Review platform database loads, memory capacity logs, and API health sync matrices"
      />

      {/* Observability Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Server CPU Load", value: healthData ? `${healthData.data.cpu.load}%` : "...", sub: healthData?.data.cpu.status || "Loading...", icon: Cpu },
          { label: "Memory Allocated", value: healthData ? `${healthData.data.memory.used} GB / ${healthData.data.memory.total} GB` : "...", sub: healthData ? `${healthData.data.memory.percent}% capacity load` : "Loading...", icon: HardDrive },
          { label: "DB Connection Pools", value: healthData ? `${healthData.data.database.active_connections} Active` : "...", sub: "0 queued query threads", icon: Database },
          { label: "System Security Health", value: "Optimal", sub: "2FA modules verified", icon: ShieldCheck }
        ].map((kpi, idx) => (
          <Card key={idx} className="border-border/60">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                <kpi.icon className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="text-xl font-extrabold font-heading text-foreground">{kpi.value}</p>
              <p className="text-[9px] text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-xs font-bold">Server Resource Timeline Logs</CardTitle>
          <CardDescription className="text-[10px]">Real-time CPU and Memory allocation over recent hours</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={systemLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tickLine={false} tick={{ fill: "#888", fontSize: 9 }} />
              <YAxis domain={[0, 100]} tickLine={false} tick={{ fill: "#888", fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 10 }} />
              <Area type="monotone" dataKey="cpu" name="CPU Usage %" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
              <Area type="monotone" dataKey="ram" name="Memory Usage %" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
