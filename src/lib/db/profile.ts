import { prisma } from "@/lib/prisma";
import { type EditorPreferences } from "@/types/editor-preferences";
import { parseStoredPreferences } from "@/lib/editor-preferences-validation";

export type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  password: boolean;
  createdAt: Date;
};

export type ItemTypeCount = {
  name: string;
  icon: string;
  color: string;
  count: number;
};

export async function getProfileUser(userId: string): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    password: !!user.password,
    createdAt: user.createdAt,
  };
}

export async function getEditorPreferences(
  userId: string
): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  });

  return parseStoredPreferences(user?.editorPreferences ?? null);
}

export async function getItemTypeBreakdown(userId: string): Promise<ItemTypeCount[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true, userId: null },
    select: {
      name: true,
      icon: true,
      color: true,
      _count: {
        select: {
          items: { where: { userId } },
        },
      },
    },
  });

  return types.map((t) => ({
    name: t.name,
    icon: t.icon,
    color: t.color,
    count: t._count.items,
  }));
}
