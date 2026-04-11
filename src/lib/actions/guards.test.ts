import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";
import { requireSession } from "./guards";

const authMock = vi.fn<() => Promise<Session | null>>();

vi.mock("@/auth", () => ({
  auth: () => authMock(),
}));

describe("requireSession", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("returns ok: false when there is no session", async () => {
    authMock.mockResolvedValue(null);
    const result = await requireSession();
    expect(result).toEqual({ ok: false, error: "Not authenticated" });
  });

  it("returns ok: false when session has no user id", async () => {
    authMock.mockResolvedValue({
      user: { email: "a@b.com" },
      expires: "2099-01-01",
    } as unknown as Session);
    const result = await requireSession();
    expect(result.ok).toBe(false);
  });

  it("returns ok: true with userId and isPro when session is valid", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-123", isPro: true },
      expires: "2099-01-01",
    } as unknown as Session);
    const result = await requireSession();
    expect(result).toEqual({ ok: true, userId: "user-123", isPro: true });
  });

  it("defaults isPro to false when missing from session", async () => {
    authMock.mockResolvedValue({
      user: { id: "user-123" },
      expires: "2099-01-01",
    } as unknown as Session);
    const result = await requireSession();
    expect(result).toEqual({ ok: true, userId: "user-123", isPro: false });
  });
});
