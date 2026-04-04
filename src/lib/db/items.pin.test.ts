import { describe, it, expect, vi, beforeEach } from "vitest";
import { toggleItemPin } from "./items";
import { prisma } from "@/lib/prisma";

describe("toggleItemPin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when item not found", async () => {
    vi.spyOn(prisma.item, "findFirst").mockResolvedValue(null);

    const result = await toggleItemPin("user-1", "nonexistent-item");

    expect(result).toBeNull();
  });

  it("toggles isPinned from false to true", async () => {
    vi.spyOn(prisma.item, "findFirst").mockResolvedValue({ isPinned: false } as any);
    vi.spyOn(prisma.item, "updateMany").mockResolvedValue({ count: 1 });

    const result = await toggleItemPin("user-1", "item-1");

    expect(result).toBe(true);
    expect(prisma.item.updateMany).toHaveBeenCalledWith({
      where: { id: "item-1", userId: "user-1" },
      data: { isPinned: true },
    });
  });

  it("toggles isPinned from true to false", async () => {
    vi.spyOn(prisma.item, "findFirst").mockResolvedValue({ isPinned: true } as any);
    vi.spyOn(prisma.item, "updateMany").mockResolvedValue({ count: 1 });

    const result = await toggleItemPin("user-1", "item-1");

    expect(result).toBe(false);
    expect(prisma.item.updateMany).toHaveBeenCalledWith({
      where: { id: "item-1", userId: "user-1" },
      data: { isPinned: false },
    });
  });
});
