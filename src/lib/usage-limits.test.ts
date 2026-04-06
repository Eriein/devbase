import { describe, it, expect } from "vitest";
import {
  isAtItemLimit,
  isAtCollectionLimit,
  canUploadFiles,
  canUseAI,
  canExport,
  canCreateCustomTypes,
  itemLimitMessage,
  collectionLimitMessage,
} from "./usage-limits";

describe("isAtItemLimit", () => {
  it("returns false for pro user with many items", () => {
    expect(isAtItemLimit(true, 1000)).toBe(false);
  });

  it("returns false for free user below the limit", () => {
    expect(isAtItemLimit(false, 49)).toBe(false);
  });

  it("returns true for free user at exactly the limit", () => {
    expect(isAtItemLimit(false, 50)).toBe(true);
  });

  it("returns true for free user above the limit", () => {
    expect(isAtItemLimit(false, 51)).toBe(true);
  });
});

describe("isAtCollectionLimit", () => {
  it("returns false for pro user with many collections", () => {
    expect(isAtCollectionLimit(true, 100)).toBe(false);
  });

  it("returns false for free user below the limit", () => {
    expect(isAtCollectionLimit(false, 2)).toBe(false);
  });

  it("returns true for free user at exactly the limit", () => {
    expect(isAtCollectionLimit(false, 3)).toBe(true);
  });

  it("returns true for free user above the limit", () => {
    expect(isAtCollectionLimit(false, 4)).toBe(true);
  });
});

describe("canUploadFiles", () => {
  it("returns true for pro user", () => {
    expect(canUploadFiles(true)).toBe(true);
  });

  it("returns false for free user", () => {
    expect(canUploadFiles(false)).toBe(false);
  });
});

describe("canUseAI", () => {
  it("returns true for pro user", () => {
    expect(canUseAI(true)).toBe(true);
  });

  it("returns false for free user", () => {
    expect(canUseAI(false)).toBe(false);
  });
});

describe("canExport", () => {
  it("returns true for pro user", () => {
    expect(canExport(true)).toBe(true);
  });

  it("returns false for free user", () => {
    expect(canExport(false)).toBe(false);
  });
});

describe("canCreateCustomTypes", () => {
  it("returns true for pro user", () => {
    expect(canCreateCustomTypes(true)).toBe(true);
  });

  it("returns false for free user", () => {
    expect(canCreateCustomTypes(false)).toBe(false);
  });
});

describe("itemLimitMessage", () => {
  it("includes the limit number in the message", () => {
    const msg = itemLimitMessage(50);
    expect(msg).toContain("50");
  });
});

describe("collectionLimitMessage", () => {
  it("includes the limit number in the message", () => {
    const msg = collectionLimitMessage(3);
    expect(msg).toContain("3");
  });
});
