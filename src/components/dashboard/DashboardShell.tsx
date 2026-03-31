"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sidebar, type SidebarData } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CreateItemDialog } from "@/components/items/CreateItemDialog";
import { CreateCollectionDialog } from "@/components/collections/CreateCollectionDialog";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { CommandPalette } from "@/components/search/CommandPalette";

// ─── Context ──────────────────────────────────────────────────

interface CreateItemDialogContextValue {
  openCreateDialog: (typeId?: string) => void;
}

export const CreateItemDialogContext =
  createContext<CreateItemDialogContextValue>({
    openCreateDialog: () => {},
  });

export function useCreateItemDialog() {
  return useContext(CreateItemDialogContext);
}

// ─── Shell ────────────────────────────────────────────────────

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
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newItemTypeId, setNewItemTypeId] = useState<string | undefined>();
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const openCreateDialog = useCallback((typeId?: string) => {
    setNewItemTypeId(typeId);
    setNewItemOpen(true);
  }, []);

  const sidebarData: SidebarData = { sidebarItemTypes, sidebarCollections, userName, userImage };

  return (
    <CreateItemDialogContext.Provider value={{ openCreateDialog }}>
    <ItemDrawerProvider>
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
        <TopBar
          onToggleSidebar={toggleSidebar}
          onNewItem={() => openCreateDialog()}
          onNewCollection={() => setNewCollectionOpen(true)}
          onOpenSearch={() => setPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <CreateItemDialog
        open={newItemOpen}
        onOpenChange={setNewItemOpen}
        itemTypes={sidebarItemTypes}
        initialTypeId={newItemTypeId}
      />
      <CreateCollectionDialog
        open={newCollectionOpen}
        onOpenChange={setNewCollectionOpen}
      />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
    </ItemDrawerProvider>
    </CreateItemDialogContext.Provider>
  );
}
