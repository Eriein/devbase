import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY_HOURS = 24;
const PASSWORD_RESET_EXPIRY_HOURS = 1;
const PASSWORD_RESET_PREFIX = "password-reset:";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function generateVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      hashedToken,
      expires,
    },
  });

  return token;
}

export async function validateVerificationToken(token: string) {
  const hashedToken = hashToken(token);
  const record = await prisma.verificationToken.findUnique({
    where: { hashedToken },
  });

  if (!record) return { error: "Invalid verification link." };
  if (record.expires < new Date()) return { error: "Verification link has expired." };

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { hashedToken },
  });

  return { email: record.identifier };
}

// ─── Password Reset Tokens ──────────────────────────────────

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);
  const identifier = `${PASSWORD_RESET_PREFIX}${email}`;

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      hashedToken,
      expires,
    },
  });

  return token;
}

export async function validatePasswordResetToken(token: string) {
  const hashedToken = hashToken(token);
  const record = await prisma.verificationToken.findUnique({
    where: { hashedToken },
  });

  if (!record) return { error: "Invalid reset link." };
  if (!record.identifier.startsWith(PASSWORD_RESET_PREFIX)) return { error: "Invalid reset link." };
  if (record.expires < new Date()) return { error: "Reset link has expired." };

  const email = record.identifier.slice(PASSWORD_RESET_PREFIX.length);

  await prisma.verificationToken.delete({
    where: { hashedToken },
  });

  return { email };
}
