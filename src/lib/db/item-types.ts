import { prisma } from "@/lib/prisma";

export type SidebarItemType = {
  id: string;
  name: string;
  icon: string;
  color: string;
  itemCount: number;
};

export async function getSystemItemTypes(userId: string): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true, userId: null },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      items: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  return types.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    color: t.color,
    itemCount: t.items.length,
  }));
}
