"use client";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Users, ClipboardList, FileText,
  MessageSquare, Calendar, Sparkles, Settings, LogOut, HeartPulse, BrainCircuit, UserCircle2
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mainNav = [
  { title: "Dashboard", url: "/therapist", icon: LayoutDashboard },
  { title: "Assigned Students", url: "/therapist/students", icon: Users },
];

const clinicalNav = [
  { title: "Therapy Sessions", url: "/therapist/sessions", icon: HeartPulse },
  { title: "Assessments", url: "/therapist/assessments", icon: ClipboardList },
  { title: "Recommendations", url: "/therapist/recommendations", icon: Sparkles },
  { title: "Reports", url: "/therapist/reports", icon: HeartPulse },
];

const engageNav = [
  { title: "Messages", url: "/therapist/messages", icon: MessageSquare },
  { title: "Calendar", url: "/therapist/calendar", icon: Calendar },
  { title: "Laura AI", url: "/therapist/laura", icon: Sparkles },
];

const systemNav = [
  { title: "Profile", url: "/therapist/profile", icon: UserCircle2 },
  { title: "Settings", url: "/therapist/settings", icon: Settings },
];

function NavGroup({ items, isActive }: { items: typeof mainNav; isActive: (url: string) => boolean }) {
  return (
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
}

export function TherapistSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push("/login"); };
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "TH";
  const isActive = (url: string) => url === "/therapist" ? pathname === "/therapist" : pathname.startsWith(url);

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
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-2">Therapist Portal</span>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent><NavGroup items={mainNav} isActive={isActive} /></SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Clinical</SidebarGroupLabel>
          <SidebarGroupContent><NavGroup items={clinicalNav} isActive={isActive} /></SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Engage</SidebarGroupLabel>
          <SidebarGroupContent><NavGroup items={engageNav} isActive={isActive} /></SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent><NavGroup items={systemNav} isActive={isActive} /></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3 px-1 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-bold bg-teal-500/20 text-teal-600">{initials}</AvatarFallback>
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
