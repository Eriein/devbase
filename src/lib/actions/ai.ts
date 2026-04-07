"use server";

import { auth } from "@/auth";
import { openai, AI_MODEL } from "@/lib/openai";
import { ratelimit, withRateLimit } from "@/lib/rate-limit";
import { canUseAI } from "@/lib/usage-limits";
import {
  validateAutoTagsInput,
  buildTagPromptText,
  parseTagsResponse,
} from "@/lib/ai-tags-validation";
import type { AutoTagsInput } from "@/lib/ai-tags-validation";

// ─── Types ───────────────────────────────────────────────────

export type GenerateAutoTagsResult =
  | { success: true; tags: string[] }
  | { success: false; error: string; minutesUntilReset?: number };

// ─── Server action ───────────────────────────────────────────

export async function generateAutoTags(
  input: AutoTagsInput
): Promise<GenerateAutoTagsResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!canUseAI(session.user.isPro)) {
    return { success: false, error: "AI features require a Pro subscription" };
  }

  const validation = validateAutoTagsInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const result = await withRateLimit(
      ratelimit.ai,
      session.user.id,
      async () => {
        const promptText = buildTagPromptText(validation.data);

        const response = await openai.responses.create({
          model: AI_MODEL,
          instructions:
            "You are a developer tool assistant. Given a code snippet, note, or other developer content, suggest 3-5 concise, relevant tags. Return a JSON object with a \"tags\" array of lowercase strings. Only return the JSON, nothing else.",
          input: `Suggest 3-5 tags for this item. Return JSON only.\n\n${promptText}`,
          text: {
            format: { type: "json_object" },
          },
        });

        const tags = parseTagsResponse(response.output_text);
        if (tags.length === 0) {
          return {
            success: false as const,
            error: "AI returned no tags. Try again or add more content.",
          };
        }

        return { success: true as const, tags };
      }
    );

    // withRateLimit returns a rate-limit error object if throttled
    if ("minutesUntilReset" in result) {
      return {
        success: false,
        error: result.error,
        minutesUntilReset: result.minutesUntilReset,
      };
    }

    return result;
  } catch {
    return { success: false, error: "Failed to generate tags. Please try again." };
  }
}
