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
import {
  validateAutoDescriptionInput,
  buildDescriptionPromptText,
  parseDescriptionResponse,
} from "@/lib/ai-description-validation";
import type { AutoDescriptionInput } from "@/lib/ai-description-validation";
import {
  validateExplainCodeInput,
  buildExplainPromptText,
  parseExplanationResponse,
} from "@/lib/ai-explain-validation";
import type { ExplainCodeInput } from "@/lib/ai-explain-validation";
import {
  validateOptimizePromptInput,
  buildOptimizePromptText,
  parseOptimizeResponse,
} from "@/lib/ai-optimize-validation";
import type { OptimizePromptInput } from "@/lib/ai-optimize-validation";

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

// ─── generateAutoDescription ─────────────────────────────────

export type GenerateAutoDescriptionResult =
  | { success: true; description: string }
  | { success: false; error: string; minutesUntilReset?: number };

export async function generateAutoDescription(
  input: AutoDescriptionInput
): Promise<GenerateAutoDescriptionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!canUseAI(session.user.isPro)) {
    return { success: false, error: "AI features require a Pro subscription" };
  }

  const validation = validateAutoDescriptionInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const result = await withRateLimit(
      ratelimit.ai,
      session.user.id,
      async () => {
        const promptText = buildDescriptionPromptText(validation.data);

        const response = await openai.responses.create({
          model: AI_MODEL,
          instructions:
            "You are a developer tool assistant. Given a developer item (snippet, prompt, command, note, link, file, or image), write an informative, concise description of exactly 1 to 2 sentences. Be specific about what the item is or does. No markdown, no quotes, no leading phrases like \"This is\" or \"Description:\". Return only the description text.",
          input: `Write a 1-2 sentence description for this item.\n\n${promptText}`,
        });

        const description = parseDescriptionResponse(response.output_text);
        if (description.length === 0) {
          return {
            success: false as const,
            error: "AI returned no description. Try again or add more content.",
          };
        }

        return { success: true as const, description };
      }
    );

    if ("minutesUntilReset" in result) {
      return {
        success: false,
        error: result.error,
        minutesUntilReset: result.minutesUntilReset,
      };
    }

    return result;
  } catch {
    return {
      success: false,
      error: "Failed to generate description. Please try again.",
    };
  }
}

// ─── explainCode ─────────────────────────────────────────────

export type ExplainCodeResult =
  | { success: true; explanation: string }
  | { success: false; error: string; minutesUntilReset?: number };

export async function explainCode(
  input: ExplainCodeInput
): Promise<ExplainCodeResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!canUseAI(session.user.isPro)) {
    return { success: false, error: "AI features require a Pro subscription" };
  }

  const validation = validateExplainCodeInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const result = await withRateLimit(
      ratelimit.ai,
      session.user.id,
      async () => {
        const promptText = buildExplainPromptText(validation.data);

        const response = await openai.responses.create({
          model: AI_MODEL,
          instructions:
            "You are a developer tool assistant. Given a code snippet or terminal command, write a concise 200-300 word explanation in markdown. Cover what the code does and the key concepts, functions, or flags involved. Use short paragraphs and inline code formatting where appropriate. Do not wrap your response in a fenced code block and do not start with \"Explanation:\". Return only the markdown explanation.",
          input: `Explain this ${validation.data.itemTypeName.toLowerCase()} in 200-300 words of markdown.\n\n${promptText}`,
        });

        const explanation = parseExplanationResponse(response.output_text);
        if (explanation.length === 0) {
          return {
            success: false as const,
            error: "AI returned no explanation. Try again.",
          };
        }

        return { success: true as const, explanation };
      }
    );

    if ("minutesUntilReset" in result) {
      return {
        success: false,
        error: result.error,
        minutesUntilReset: result.minutesUntilReset,
      };
    }

    return result;
  } catch {
    return {
      success: false,
      error: "Failed to generate explanation. Please try again.",
    };
  }
}

// ─── optimizePrompt ───────────────────────────────────────────

export type OptimizePromptResult =
  | { success: true; optimizedPrompt: string }
  | { success: false; error: string; minutesUntilReset?: number };

export async function optimizePrompt(
  input: OptimizePromptInput
): Promise<OptimizePromptResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!canUseAI(session.user.isPro)) {
    return { success: false, error: "AI features require a Pro subscription" };
  }

  const validation = validateOptimizePromptInput(input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const result = await withRateLimit(
      ratelimit.ai,
      session.user.id,
      async () => {
        const promptText = buildOptimizePromptText(validation.data);

        const response = await openai.responses.create({
          model: AI_MODEL,
          instructions:
            "You are a prompt refinement assistant. Improve the user's prompt by adding specific details, context, and structure where needed. Make it more clear and actionable. If the prompt is already good, return it unchanged. Return ONLY the optimized prompt text, no commentary, no labels like 'Optimized:', no code blocks.",
          input: `Improve this prompt:\n\n${promptText}`,
        });

        const optimizedPrompt = parseOptimizeResponse(response.output_text);
        if (optimizedPrompt.length === 0) {
          return {
            success: false as const,
            error: "AI returned an empty response. Try again.",
          };
        }

        return { success: true as const, optimizedPrompt };
      }
    );

    if ("minutesUntilReset" in result) {
      return {
        success: false,
        error: result.error,
        minutesUntilReset: result.minutesUntilReset,
      };
    }

    return result;
  } catch {
    return {
      success: false,
      error: "Failed to optimize prompt. Please try again.",
    };
  }
}
