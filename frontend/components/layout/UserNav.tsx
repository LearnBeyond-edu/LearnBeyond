"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useLearningStore } from "@/store/useLearningStore";

function getDashboardBasePath(role?: string | null) {
  switch (role) {
    case "Parent":
      return "/parent";
    case "Teacher":
      return "/teacher";
    case "Therapist":
      return "/therapist";
    case "Institution Admin":
    case "Platform Admin":
      return "/admin";
    default:
      return "";
  }
}

export function UserNav() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { rewards } = useLearningStore();
  const basePath = getDashboardBasePath(user?.role ?? null);

  const hasGoldenFrame = rewards.find(r => r.id === 'rew-2')?.unlocked;
  const hasAstronautAvatar = rewards.find(r => r.id === 'rew-3')?.unlocked;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`relative h-8 w-8 rounded-full focus:outline-none transition-all ${hasGoldenFrame ? "ring-2 ring-yellow-500 ring-offset-1 ring-offset-background shadow-[0_0_10px_rgba(234,179,8,0.5)]" : ""}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={hasAstronautAvatar ? "https://api.dicebear.com/7.x/bottts/svg?seed=astronaut&backgroundColor=0d9488" : ""} alt={user?.firstName ?? "User"} />
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user ? `${user.firstName} ${user.lastName}` : "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email ?? "user@learnbeyond.com"}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(basePath ? `${basePath}/profile` : "/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(basePath ? `${basePath}/settings` : "/settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

