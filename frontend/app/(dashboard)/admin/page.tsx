"use client";

import { Building2, Activity, ShieldCheck, Crown, Zap, Brain } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useInstitutions } from "@/hooks/useInstitutions";
import { useAuthStore } from "@/store/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Institution } from "@/types/platform";

// Small inline chart bar (no external chart lib needed for simple bars)
function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: institutionsData, isLoading: loadingInstitutions } = useInstitutions(100, 0);

  const institutions: Institution[] = institutionsData?.data ?? [];
  const totalInstitutions = institutionsData?.meta.total ?? 0;
  
  const activeInstitutions = institutions.filter(i => (i as any).status === 'Active' || !(i as any).status).length;
  const premiumInstitutions = institutions.filter(i => i.subscription_plan === 'Professional' || i.subscription_plan === 'Enterprise').length;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentOnboards = institutions.filter(i => new Date(i.created_at) > thirtyDaysAgo).length;

  const starterCount = institutions.filter(i => i.subscription_plan === 'Starter' || !i.subscription_plan).length;
  const proCount = institutions.filter(i => i.subscription_plan === 'Professional').length;
  const enterpriseCount = institutions.filter(i => i.subscription_plan === 'Enterprise').length;

  const recentInstitutions = [...institutions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const globalLoading = loadingInstitutions;

  const stats = [
    {
      title: "Total Institutions",
      value: totalInstitutions,
      icon: <Building2 className="h-4 w-4" />,
      accentColor: "bg-blue-500/10 text-blue-500",
      loading: loadingInstitutions,
    },
    {
      title: "Active Platforms",
      value: activeInstitutions,
      icon: <ShieldCheck className="h-4 w-4" />,
      accentColor: "bg-green-500/10 text-green-500",
      loading: loadingInstitutions,
    },
    {
      title: "Premium Subscribers",
      value: premiumInstitutions,
      icon: <Crown className="h-4 w-4" />,
      accentColor: "bg-violet-500/10 text-violet-500",
      loading: loadingInstitutions,
    },
    {
      title: "Recent Onboards",
      value: recentOnboards,
      icon: <Zap className="h-4 w-4" />,
      accentColor: "bg-orange-500/10 text-orange-500",
      subtitle: "Last 30 Days",
      loading: loadingInstitutions,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? "Admin"} 👋`}
        subtitle="Here's a real-time overview of the LearnBeyond platform."
      />

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {stats.map((s) => (
          <motion.div key={s.title} variants={item}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Lower Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Institutions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Institutions</CardTitle>
            <CardDescription>Latest institutions registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInstitutions ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : recentInstitutions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No institutions yet.</p>
            ) : (
              <div className="space-y-3">
                {recentInstitutions.map((inst) => (
                  <div key={inst.id} className="flex items-center gap-4 p-3 rounded-xl border bg-muted/30 hover:bg-muted/60 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium truncate flex items-center gap-2">
                          {inst.name}
                          <Badge variant="outline" className="text-[10px] py-0 h-5 bg-teal-500/10 text-teal-600 border-teal-500/20">
                            {inst.subscription_plan || "Starter"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{inst.email ?? "No email"}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(inst.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription Tiers</CardTitle>
            <CardDescription>Breakdown by platform tier</CardDescription>
          </CardHeader>
          <CardContent>
            {globalLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full rounded" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Starter", value: starterCount, color: "bg-blue-500" },
                  { label: "Professional", value: proCount, color: "bg-violet-500" },
                  { label: "Enterprise", value: enterpriseCount, color: "bg-orange-500" },
                ].map(({ label, value, color }) => {
                  const total = totalInstitutions;
                  return (
                    <div key={label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-700`}
                          style={{ width: total > 0 ? `${(value / total) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Add Institution", href: "/admin/institutions/create", icon: Building2, color: "text-blue-500 bg-blue-500/10" },
              { label: "View Reports", href: "/admin/reports", icon: Activity, color: "text-green-500 bg-green-500/10" },
              { label: "Laura AI", href: "/admin/laura", icon: Brain, color: "text-orange-500 bg-orange-500/10" },
            ].map(({ label, href, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:bg-muted/50 transition-colors text-center group"
              >
                <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
