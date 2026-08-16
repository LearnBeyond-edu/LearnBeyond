"use client";

import React from "react";
import { Megaphone, Pin, CheckCircle2 } from "lucide-react";
import { useAnnouncementStore } from "@/store/useAnnouncementStore";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AnnouncementDropdown() {
  const { announcements } = useAnnouncementStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const getRolePrefix = () => {
    switch (user?.role) {
      case "Platform Admin": return "/admin";
      case "Institution Admin": return "/school";
      case "Teacher": return "/teacher";
      case "Therapist": return "/therapist";
      case "Parent": return "/parent";
      default: return "/student";
    }
  };

  const roleMap: Record<string, string> = {
    "Student": "students",
    "Teacher": "teachers",
    "Parent": "parents",
    "Therapist": "therapists",
  };
  const userAudience = roleMap[user?.role || ""] || "everyone";
  
  // School Admins see everything, others see only 'everyone' or their specific role
  const relevantAnnouncements = user?.role === "Institution Admin" 
    ? announcements 
    : announcements.filter(a => a.audience === "everyone" || a.audience === userAudience);

  const pinnedCount = relevantAnnouncements.filter(a => a.pinned).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-muted/40 transition-all focus:outline-none shrink-0">
        <Megaphone className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        {pinnedCount > 0 && (
          <Badge className="absolute -top-0.5 -right-0.5 h-4.5 min-w-[18px] px-1 flex items-center justify-center bg-blue-600 text-white border-2 border-background text-[8px] font-extrabold rounded-full">
            {pinnedCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-2 text-xs" align="end">
        <div className="flex justify-between items-center px-2 py-1.5">
          <span className="font-bold text-xs flex items-center gap-1">
            <Megaphone className="h-4 w-4 text-blue-600" /> Announcements
          </span>
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-[320px] overflow-y-auto space-y-1 py-1">
          {relevantAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-blue-600/30 mb-2" />
              <p className="font-semibold">No announcements</p>
              <p className="text-[9px] mt-0.5">Check back later for updates.</p>
            </div>
          ) : (
            relevantAnnouncements.map(a => (
              <div 
                key={a.id} 
                className={`p-2.5 rounded-xl border border-border/40 bg-card hover:bg-muted/10 flex items-start gap-2.5 transition-all ${
                  a.pinned ? "bg-blue-500/5 border-blue-500/20" : ""
                }`}
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="font-bold truncate text-[11px] flex items-center gap-1">
                    {a.pinned && <Pin className="h-3 w-3 text-blue-600" />}
                    {a.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-3 leading-relaxed">{a.message}</p>
                  <div className="flex justify-between items-center pt-1">
                    <Badge variant="outline" className="text-[8px] uppercase">{a.audience}</Badge>
                    <span className="text-[8px] text-muted-foreground font-medium">
                      {format(new Date(a.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DropdownMenuSeparator />
        <div className="p-1">
          <Button 
            variant="ghost" 
            className="w-full text-center text-[10px] h-8 rounded-lg font-bold text-blue-600 hover:text-blue-700"
            onClick={() => router.push(`${getRolePrefix()}/announcements`)}
          >
            View Announcements Page
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
