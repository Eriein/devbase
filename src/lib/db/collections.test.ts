import { describe, it, expect } from "vitest";
import { computeTypeStats } from "./collections";

const snippet = { id: "type-snippet", icon: "Code", color: "#3b82f6", name: "snippet" };
const prompt  = { id: "type-prompt",  icon: "MessageSquare", color: "#8b5cf6", name: "prompt" };
const note    = { id: "type-note",    icon: "FileText", color: "#10b981", name: "note" };

describe("computeTypeStats", () => {
  it("returns empty typeIcons and fallback color for empty input", () => {
    const result = computeTypeStats([]);
    expect(result.typeIcons).toEqual([]);
    expect(result.dominantColor).toBe("#6b7280");
  });

  it("single type becomes dominant and only icon", () => {
    const result = computeTypeStats([snippet, snippet, snippet]);
    expect(result.dominantColor).toBe(snippet.color);
    expect(result.typeIcons).toHaveLength(1);
    expect(result.typeIcons[0].id).toBe(snippet.id);
  });

  it("dominant color is the most-frequent type's color", () => {
    // 3 snippets, 1 prompt — snippet should win
    const result = computeTypeStats([snippet, prompt, snippet, snippet]);
    expect(result.dominantColor).toBe(snippet.color);
  });

  it("sorts typeIcons by count descending", () => {
    // 2 prompts, 3 snippets, 1 note
    const result = computeTypeStats([prompt, snippet, note, snippet, prompt, snippet]);
    expect(result.typeIcons.map((t) => t.id)).toEqual([
      snippet.id,
      prompt.id,
      note.id,
    ]);
  });

  it("caps typeIcons at 4 entries", () => {
    const extra1 = { id: "t1", icon: "A", color: "#aaa", name: "a" };
    const extra2 = { id: "t2", icon: "B", color: "#bbb", name: "b" };
    const extra3 = { id: "t3", icon: "C", color: "#ccc", name: "c" };
    const extra4 = { id: "t4", icon: "D", color: "#ddd", name: "d" };
    const extra5 = { id: "t5", icon: "E", color: "#eee", name: "e" };
    const result = computeTypeStats([extra1, extra2, extra3, extra4, extra5]);
    expect(result.typeIcons).toHaveLength(4);
  });

  it("strips count from returned typeIcons", () => {
    const result = computeTypeStats([snippet, snippet]);
    const icon = result.typeIcons[0];
    expect(icon).toEqual({ id: snippet.id, icon: snippet.icon, color: snippet.color, name: snippet.name });
    expect("count" in icon).toBe(false);
  });

  it("tie-breaking: both types appear in typeIcons", () => {
    // 1 snippet, 1 prompt — both count=1, order is insertion-based
    const result = computeTypeStats([snippet, prompt]);
    const ids = result.typeIcons.map((t) => t.id);
    expect(ids).toContain(snippet.id);
    expect(ids).toContain(prompt.id);
  });
});
