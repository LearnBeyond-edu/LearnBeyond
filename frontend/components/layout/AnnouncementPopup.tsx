"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAnnouncementStore, type Announcement } from "@/store/useAnnouncementStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Pin, Calendar, CheckCircle2, ChevronRight, ChevronLeft, Bell } from "lucide-react";
import { format } from "date-fns";

export function AnnouncementPopup() {
  const { announcements } = useAnnouncementStore();
  const { user, isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seenIds, setSeenIds] = useState<string[]>([]);

  // Load seen announcement IDs for this user
  useEffect(() => {
    if (!user?.id) return;
    try {
      const stored = localStorage.getItem(`learnbeyond_seen_announcements_${user.id}`);
      if (stored) {
        setSeenIds(JSON.parse(stored));
      } else {
        setSeenIds([]);
      }
    } catch {
      setSeenIds([]);
    }
  }, [user?.id]);

  // Determine audience matching for the user
  const roleMap: Record<string, string> = {
    "Student": "students",
    "Teacher": "teachers",
    "Parent": "parents",
    "Therapist": "therapists",
  };
  const userAudience = roleMap[user?.role || ""] || "everyone";

  // Filter announcements for this user
  const relevantAnnouncements = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    
    return announcements.filter((a) => {
      if (user.role === "Platform Admin" || user.role === "Institution Admin") {
        return true;
      }
      return a.audience === "everyone" || a.audience === userAudience;
    });
  }, [announcements, user, isAuthenticated, userAudience]);

  // Unread announcements that have not been dismissed/seen yet
  const unreadAnnouncements = useMemo(() => {
    return relevantAnnouncements.filter((a) => !seenIds.includes(a.id));
  }, [relevantAnnouncements, seenIds]);

  // Automatically pop up when there are unread announcements
  useEffect(() => {
    if (unreadAnnouncements.length > 0 && !open) {
      setCurrentIndex(0);
      setOpen(true);
    }
  }, [unreadAnnouncements.length, open]);

  // Listen to custom dispatch events for real-time announcements
  useEffect(() => {
    const handleNewAnnouncement = () => {
      // Re-trigger popup if new announcement is added
      if (user?.id) {
        const stored = localStorage.getItem(`learnbeyond_seen_announcements_${user.id}`);
        setSeenIds(stored ? JSON.parse(stored) : []);
      }
    };

    window.addEventListener("newAnnouncementPublished", handleNewAnnouncement);
    window.addEventListener("storage", handleNewAnnouncement);
    return () => {
      window.removeEventListener("newAnnouncementPublished", handleNewAnnouncement);
      window.removeEventListener("storage", handleNewAnnouncement);
    };
  }, [user?.id]);

  if (!isAuthenticated || unreadAnnouncements.length === 0) {
    return null;
  }

  const current = unreadAnnouncements[currentIndex] || unreadAnnouncements[0];
  if (!current) return null;

  const markCurrentAsSeen = () => {
    if (!user?.id || !current) return;
    const newSeen = Array.from(new Set([...seenIds, current.id]));
    setSeenIds(newSeen);
    try {
      localStorage.setItem(`learnbeyond_seen_announcements_${user.id}`, JSON.stringify(newSeen));
    } catch {}

    if (currentIndex < unreadAnnouncements.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setOpen(false);
    }
  };

  const markAllAsSeen = () => {
    if (!user?.id) return;
    const allUnreadIds = unreadAnnouncements.map(a => a.id);
    const newSeen = Array.from(new Set([...seenIds, ...allUnreadIds]));
    setSeenIds(newSeen);
    try {
      localStorage.setItem(`learnbeyond_seen_announcements_${user.id}`, JSON.stringify(newSeen));
    } catch {}
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) markCurrentAsSeen();
      else setOpen(true);
    }}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-border/80 shadow-2xl rounded-3xl">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/15 rounded-xl backdrop-blur-md">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                  New Announcement
                </span>
                <p className="text-[11px] text-white/80">
                  School & Staff Broadcast
                </p>
              </div>
            </div>
            {unreadAnnouncements.length > 1 && (
              <Badge className="bg-white/20 text-white border-none text-[10px] font-bold">
                {currentIndex + 1} of {unreadAnnouncements.length}
              </Badge>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
                {current.pinned && <Pin className="h-4 w-4 text-blue-600 shrink-0" />}
                {current.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
              <Badge variant="outline" className="text-[9px] uppercase font-bold text-blue-600 border-blue-500/30 bg-blue-500/5">
                Audience: {current.audience}
              </Badge>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(current.createdAt), "MMM d, yyyy · h:mm a")}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap max-h-[220px] overflow-y-auto">
            {current.message}
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/20 border-t border-border/40 flex sm:justify-between items-center gap-2">
          {unreadAnnouncements.length > 1 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsSeen}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss All ({unreadAnnouncements.length})
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button
              onClick={markCurrentAsSeen}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold gap-1.5 px-5 shadow-md shadow-blue-500/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              {currentIndex < unreadAnnouncements.length - 1 ? "Next Announcement" : "Got It"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
