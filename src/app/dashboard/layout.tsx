import { Code2 } from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <aside className="flex w-60 flex-col border-r border-border bg-sidebar">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Code2 className="size-4" />
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground">
            DevStash
          </span>
        </div>
        <div className="flex-1 p-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Sidebar
          </h2>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
