"use client";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, Heart, Brain,
  ClipboardCheck, Megaphone, FileText, BarChart3, Calendar,
  Sparkles, Settings, LogOut, GraduationCap as SchoolIcon, User
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mainNav = [
  { title: "Dashboard", url: "/school", icon: LayoutDashboard },
  { title: "Teachers", url: "/school/teachers", icon: Users },
  { title: "Students", url: "/school/students", icon: GraduationCap },
  { title: "Therapists", url: "/school/therapists", icon: Brain },
];

const operationsNav = [
  { title: "Announcements", url: "/school/announcements", icon: Megaphone },
  { title: "Calendar", url: "/school/calendar", icon: Calendar },
];

const insightsNav = [
  { title: "Reports", url: "/school/reports", icon: FileText },
  { title: "Analytics", url: "/school/analytics", icon: BarChart3 },
  { title: "Laura AI", url: "/school/laura", icon: Sparkles },
];

const systemNav = [
  { title: "Profile", url: "/school/profile", icon: User },
  { title: "Settings", url: "/school/settings", icon: Settings },
];

export function SchoolSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push("/login"); };
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "S";
  const isActive = (url: string) => url === "/school" ? pathname === "/school" : pathname.startsWith(url);

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
      <SidebarHeader className="flex flex-col items-center justify-center pt-8 pb-4 px-4 border-b">
        <div className="w-full h-20 flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="LearnBeyond Logo" 
            className="hidden dark:block w-full h-full object-contain mix-blend-screen"
            style={{ 
              WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)'
            }}
          />
          <img 
            src="/logo1.png" 
            alt="LearnBeyond Logo" 
            className="block dark:hidden w-full h-full object-contain mix-blend-normal"
            style={{ 
              WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)'
            }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-2">School Portal</span>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent><NavGroup items={mainNav} /></SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent><NavGroup items={operationsNav} /></SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarGroupContent><NavGroup items={insightsNav} /></SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent><NavGroup items={systemNav} /></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3 px-1 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-bold bg-emerald-500/20 text-emerald-600">{initials}</AvatarFallback>
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
