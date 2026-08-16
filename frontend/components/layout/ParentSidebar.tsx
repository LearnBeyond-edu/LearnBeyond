"use client";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Users, BookOpen, ClipboardCheck,
  MessageSquare, Bell, Calendar, Sparkles, Settings, LogOut, Heart, FileText, UserCircle2
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mainNav = [
  { title: "Dashboard", url: "/parent", icon: LayoutDashboard },
  { title: "My Children", url: "/parent/children", icon: Users },
];

const trackNav = [
  { title: "Progress & Grades", url: "/parent/progress", icon: BookOpen },
];

const engageNav = [
  { title: "Messages", url: "/parent/messages", icon: MessageSquare },
  { title: "Announcements", url: "/parent/announcements", icon: Bell },
  { title: "Calendar", url: "/parent/calendar", icon: Calendar },
  { title: "Reports", url: "/parent/reports", icon: FileText },
  { title: "Laura AI", url: "/parent/laura", icon: Sparkles },
];

const systemNav = [
  { title: "Profile", url: "/parent/profile", icon: UserCircle2 },
  { title: "Settings", url: "/parent/settings", icon: Settings },
];

export function ParentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push("/login"); };
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "P";
  const isActive = (url: string) => url === "/parent" ? pathname === "/parent" : pathname.startsWith(url);

  const NavGroup = ({ items }: { items: typeof mainNav }) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton isActive={isActive(item.url)} render={<Link href={item.url} />}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar>
      <SidebarHeader className="py-4 px-3 border-b">
        <div className="flex items-center gap-2.5 px-1">
          <div className="p-1.5 bg-rose-500/20 rounded-lg">
            <Heart className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p className="font-bold text-sm font-heading leading-none">Parent Portal</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">LearnBeyond</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent><NavGroup items={mainNav} /></SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Academic Tracking</SidebarGroupLabel>
          <SidebarGroupContent><NavGroup items={trackNav} /></SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Engage</SidebarGroupLabel>
          <SidebarGroupContent><NavGroup items={engageNav} /></SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent><NavGroup items={systemNav} /></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3 px-1 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-bold bg-rose-500/20 text-rose-600">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
