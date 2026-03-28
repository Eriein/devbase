import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const disabledRatelimit: Ratelimit = {
  limit: async () => ({ success: true, remaining: 999, reset: Date.now() + 3600000 }),
} as unknown as Ratelimit;

const isRedisConfigured = () => {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
};

export const ratelimit = {
  register: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        analytics: true,
        prefix: "ratelimit:register",
      })
    : disabledRatelimit,
  forgotPassword: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        analytics: true,
        prefix: "ratelimit:forgot-password",
      })
    : disabledRatelimit,
  resetPassword: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        analytics: true,
        prefix: "ratelimit:reset-password",
      })
    : disabledRatelimit,
  login: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        analytics: true,
        prefix: "ratelimit:login",
      })
    : disabledRatelimit,
  resendVerification: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "15 m"),
        analytics: true,
        prefix: "ratelimit:resend-verification",
      })
    : disabledRatelimit,
  upload: isRedisConfigured()
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        analytics: true,
        prefix: "ratelimit:upload",
      })
    : disabledRatelimit,
};

export function extractIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return "127.0.0.1";
}

export async function extractIPFromHeaders(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return "127.0.0.1";
}

export function createRateLimitResponse(
  error: string,
  minutesUntilReset: number
): NextResponse {
  const retryAfter = Math.ceil(minutesUntilReset / 60);
  return NextResponse.json(
    { error },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    }
  );
}

export function buildRateLimitError(
  identifier: string,
  minutesUntilReset: number
): { error: string; minutesUntilReset: number } {
  return {
    error: `Too many attempts. Please try again in ${Math.ceil(minutesUntilReset / 60)} minutes.`,
    minutesUntilReset: Math.ceil(minutesUntilReset / 60),
  };
}
