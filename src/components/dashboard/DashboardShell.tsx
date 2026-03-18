"use client";

import { useState, useCallback } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sidebar, type SidebarData } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DashboardShellProps extends SidebarData {
  children: React.ReactNode;
}

export function DashboardShell({
  children,
  sidebarItemTypes,
  sidebarCollections,
  userName,
  userImage,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const sidebarData: SidebarData = { sidebarItemTypes, sidebarCollections, userName, userImage };

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            "flex flex-col border-r border-border bg-sidebar transition-[width] duration-200",
            collapsed ? "w-14" : "w-60"
          )}
        >
          <Sidebar collapsed={collapsed} {...sidebarData} />
        </aside>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-60 p-0 bg-sidebar">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar collapsed={false} {...sidebarData} />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
