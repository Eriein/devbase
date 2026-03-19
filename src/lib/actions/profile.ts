"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/auth";

// ─── Types ────────────────────────────────────────────────────

export type ProfileActionState = {
  error?: string;
  success?: boolean;
};

// ─── Pure Validation ─────────────────────────────────────────

function validatePasswords(
  current: string,
  newPassword: string,
  confirm: string
): string | null {
  if (!current || !newPassword || !confirm) return "All fields are required";
  if (newPassword.length < 8)
    return "New password must be at least 8 characters";
  if (newPassword !== confirm) return "New passwords do not match";
  if (current === newPassword)
    return "New password must be different from current password";
  return null;
}

function isOAuthUser(user: { password: string | null } | null): boolean {
  return !user?.password;
}

// ─── Change Password ─────────────────────────────────────────

export async function changePassword(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validationError = validatePasswords(
    currentPassword,
    newPassword,
    confirmPassword
  );
  if (validationError) return { error: validationError };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) return { error: "Account does not use password authentication" };

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return { error: "Current password is incorrect" };

  await prisma.session.deleteMany({
    where: { userId: session.user.id },
  });

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}

// ─── Delete Account ──────────────────────────────────────────

export async function deleteAccount(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (isOAuthUser(user)) {
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    await signOut({ redirectTo: "/sign-in" });
    redirect("/sign-in");
  }

  const password = formData.get("password") as string;
  if (!password) return { error: "Password is required" };

  const isValid = await bcrypt.compare(password, user!.password!);
  if (!isValid) return { error: "Incorrect password" };

  await prisma.user.delete({
    where: { id: session.user.id },
  });

  await signOut({ redirectTo: "/sign-in" });
  redirect("/sign-in");
}
