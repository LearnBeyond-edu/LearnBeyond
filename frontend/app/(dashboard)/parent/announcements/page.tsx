"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAnnouncementStore } from "@/store/useAnnouncementStore";
import { useAuthStore } from "@/store/useAuthStore";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/common/AdminUI";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Info, AlertCircle, CheckCircle, Calendar, Search, BookOpen, Award, Megaphone } from "lucide-react";
import { format } from "date-fns";

const types = ["all", "info", "alert", "success"] as const;

const typeConfig: Record<string, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  info: { bg: "bg-blue-500/5", border: "border-l-blue-500", icon: <Info className="h-4 w-4 text-blue-500" />, label: "Information" },
  alert: { bg: "bg-amber-500/5", border: "border-l-amber-500", icon: <AlertCircle className="h-4 w-4 text-amber-500" />, label: "Alert" },
  success: { bg: "bg-emerald-500/5", border: "border-l-emerald-500", icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, label: "Success" },
};

export default function ParentAnnouncementsPage() {
  const { announcements: storeAnnouncements } = useAnnouncementStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<(typeof types)[number]>("all");

  const announcements = useMemo(() => {
    const roleMap: Record<string, string> = { "Parent": "parents" };
    const userAudience = roleMap[user?.role || ""] || "everyone";
    const relevantAnnouncements = storeAnnouncements.filter(a => a.audience === "everyone" || a.audience === userAudience);

    return relevantAnnouncements.filter((item) => {
      const text = `${item.title} ${item.message}`.toLowerCase();
      const guessedType = text.includes("holiday") || text.includes("closed") ? "alert" : text.includes("report") || text.includes("available") ? "success" : "info";
      const matchesType = type === "all" || guessedType === type;
      const matchesSearch = text.includes(search.toLowerCase());
      return matchesType && matchesSearch;
    }).map((item) => {
      const text = `${item.title} ${item.message}`.toLowerCase();
      const guessedType = text.includes("holiday") || text.includes("closed") ? "alert" : text.includes("report") || text.includes("available") ? "success" : "info";
      return { ...item, guessedType };
    });
  }, [storeAnnouncements, user?.role, search, type]);

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="School notices and family updates surfaced from the notifications feed"
        actions={<Badge variant="secondary" className="gap-1.5"><Megaphone className="h-3.5 w-3.5" /> {announcements.length}</Badge>}
      />

      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search announcements" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            {types.map((item) => (
              <Badge key={item} variant={type === item ? "default" : "outline"} className="cursor-pointer" onClick={() => setType(item)}>
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {announcements.length === 0 ? (
        <EmptyState icon={<Bell className="h-14 w-14" />} title="No announcements found" description="Try a different search or category." />
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement, index) => {
            const cfg = typeConfig[announcement.guessedType] ?? typeConfig.info;
            return (
              <motion.div key={announcement.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className={`border-l-4 ${cfg.border} ${cfg.bg} border-border/40`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{cfg.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{announcement.title}</h3>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date((announcement as any).createdAt), "PPP")}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{announcement.message}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{cfg.label}</Badge>
                          {(announcement as any).pinned && <Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/5">Pinned</Badge>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
