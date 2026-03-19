import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY_HOURS = 24;
const PASSWORD_RESET_EXPIRY_HOURS = 1;
const PASSWORD_RESET_PREFIX = "password-reset:";

export async function generateVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

export async function validateVerificationToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) return { error: "Invalid verification link." };
  if (record.expires < new Date()) return { error: "Verification link has expired." };

  // Mark user as verified
  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { token },
  });

  return { email: record.identifier };
}

// ─── Password Reset Tokens ──────────────────────────────────

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);
  const identifier = `${PASSWORD_RESET_PREFIX}${email}`;

  // Delete any existing reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return token;
}

export async function validatePasswordResetToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) return { error: "Invalid reset link." };
  if (!record.identifier.startsWith(PASSWORD_RESET_PREFIX)) return { error: "Invalid reset link." };
  if (record.expires < new Date()) return { error: "Reset link has expired." };

  const email = record.identifier.slice(PASSWORD_RESET_PREFIX.length);

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { token },
  });

  return { email };
}
