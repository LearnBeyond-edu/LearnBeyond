"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserNav } from "@/components/layout/UserNav";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { AnnouncementDropdown } from "@/components/layout/AnnouncementDropdown";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-3">
        <AnnouncementDropdown />
        <NotificationDropdown />
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
