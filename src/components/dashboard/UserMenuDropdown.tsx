"use client";

import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface UserMenuDropdownProps {
  userName: string;
  userImage: string | null;
  collapsed: boolean;
}

export function UserMenuDropdown({
  userName,
  userImage,
  collapsed,
}: UserMenuDropdownProps) {
  return (
    <div className="border-t border-border p-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent cursor-pointer outline-none",
            collapsed && "justify-center px-0"
          )}
        >
          <UserAvatar name={userName} image={userImage} />
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left text-sm text-sidebar-foreground">
                {userName}
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={8}
          className="min-w-52"
        >
          <div className="flex items-center gap-2.5 px-1.5 py-1.5">
            <UserAvatar name={userName} image={userImage} className="size-8" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{userName}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => (window.location.href = "/profile")}>
            <User className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => (window.location.href = "/settings")}>
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOutAction()}>
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
