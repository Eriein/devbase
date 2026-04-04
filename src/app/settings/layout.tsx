import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSystemItemTypes } from "@/lib/db/item-types";
import { getRecentCollections } from "@/lib/db/collections";

export default async function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [itemTypes, collections] = await Promise.all([
    getSystemItemTypes(userId),
    getRecentCollections(userId, 5),
  ]);

  return (
    <DashboardShell
      sidebarItemTypes={itemTypes}
      sidebarCollections={collections}
      userName={session.user.name ?? ""}
      userImage={session.user.image ?? null}
    >
      {children}
    </DashboardShell>
  );
}
