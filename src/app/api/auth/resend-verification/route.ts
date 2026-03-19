import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { ratelimit, extractIP, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = extractIP(request as never);

  const { success, reset } = await ratelimit.resendVerification.limit(ip);

  if (!success) {
    const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000);
    return createRateLimitResponse(
      "Too many verification requests. Please try again later.",
      secondsUntilReset
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const token = await generateVerificationToken(email);
    await sendVerificationEmail(email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
