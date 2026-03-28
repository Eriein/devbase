"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { generateVerificationToken, generatePasswordResetToken, validatePasswordResetToken } from "@/lib/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { ratelimit, extractIPFromHeaders, withRateLimit } from "@/lib/rate-limit";

// ─── Types ────────────────────────────────────────────────────

export type AuthState = {
  error?: string;
};

// ─── Pure Validation ─────────────────────────────────────────

function validatePassword(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) return "Passwords do not match";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

function shouldSendPasswordReset(user: { password: string | null } | null): boolean {
  return !!user?.password;
}

function shouldResendVerification(
  user: { emailVerified: Date | null } | null
): boolean {
  return !user || !user.emailVerified;
}

// ─── Sign Out ─────────────────────────────────────────────────

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}

// ─── Sign In ──────────────────────────────────────────────────

export async function signInWithCredentials(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: (formData.get("callbackUrl") as string) ?? "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if ("code" in error) {
        if (error.code === "EMAIL_NOT_VERIFIED") {
          return { error: "Please verify your email before signing in. Check your inbox." };
        }
        if (error.code === "RATE_LIMIT_EXCEEDED") {
          return { error: "Too many login attempts. Please try again in 15 minutes." };
        }
      }
      return { error: "Invalid email or password" };
    }
    throw error;
  }

  return {};
}

export async function signInWithGitHub(callbackUrl: string) {
  await signIn("github", { redirectTo: callbackUrl });
}

// ─── Forgot Password ─────────────────────────────────────────

export async function forgotPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState & { success?: boolean }> {
  const ip = await extractIPFromHeaders();
  return withRateLimit(ratelimit.forgotPassword, ip, async () => {
    const email = formData.get("email") as string;

    if (!email) {
      return { error: "Email is required" };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (shouldSendPasswordReset(user)) {
      const token = await generatePasswordResetToken(email);
      await sendPasswordResetEmail(email, token);
    }

    return { success: true };
  }) as Promise<AuthState & { success?: boolean }>;
}

// ─── Reset Password ──────────────────────────────────────────

export async function resetPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState & { success?: boolean }> {
  const ip = await extractIPFromHeaders();
  return withRateLimit(ratelimit.resetPassword, ip, async () => {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token || !password || !confirmPassword) {
      return { error: "All fields are required" };
    }

    const passwordError = validatePassword(password, confirmPassword);
    if (passwordError) return { error: passwordError };

    const result = await validatePasswordResetToken(token);

    if ("error" in result) {
      return { error: result.error };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.findUnique({
      where: { email: result.email },
      select: { id: true },
    });

    if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
    }

    await prisma.user.update({
      where: { email: result.email },
      data: { password: hashedPassword },
    });

    redirect("/sign-in?reset=true");
  }) as Promise<AuthState & { success?: boolean }>;
}

// ─── Register ─────────────────────────────────────────────────

export async function register(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  const passwordError = validatePassword(password, confirmPassword);
  if (passwordError) return { error: passwordError };

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "A user with this email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION === "true";

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      ...(!emailVerificationEnabled && { emailVerified: new Date() }),
    },
  });

  if (emailVerificationEnabled) {
    const token = await generateVerificationToken(email);
    try {
      await sendVerificationEmail(email, token);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      return { error: "Account created but failed to send verification email. Please try resending it." };
    }
    redirect("/sign-in?verify=true");
  }

  redirect("/sign-in?registered=true");
}

// ─── Resend Verification ─────────────────────────────────────

export async function resendVerification(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState & { success?: boolean }> {
  const ip = await extractIPFromHeaders();
  return withRateLimit(ratelimit.resendVerification, ip, async () => {
    const email = formData.get("email") as string;

    if (!email) {
      return { error: "Email is required" };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!shouldResendVerification(user)) {
      return { success: true };
    }

    const token = await generateVerificationToken(email);
    await sendVerificationEmail(email, token);

    return { success: true };
  }) as Promise<AuthState & { success?: boolean }>;
}
