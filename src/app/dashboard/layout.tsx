import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSystemItemTypes } from "@/lib/db/item-types";
import { getRecentCollections } from "@/lib/db/collections";

// TODO: replace with session user once auth is wired up
const DEMO_USER_EMAIL = "demo@devstash.io";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const demoUser = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true, name: true },
  });
  const userId = demoUser?.id ?? "";

  const [itemTypes, collections] = await Promise.all([
    userId ? getSystemItemTypes(userId) : [],
    userId ? getRecentCollections(userId, 5) : [],
  ]);

  return (
    <DashboardShell
      sidebarItemTypes={itemTypes}
      sidebarCollections={collections}
      userName={demoUser?.name ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
