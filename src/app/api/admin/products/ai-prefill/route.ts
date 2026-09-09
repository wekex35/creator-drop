import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { aiCompletions, defaultModel } from "@/lib/config/llm";

type PrefillBody = {
  title?: string;
  prompt?: string;
  price?: number;
  countLabel?: string;
};

export type ProductAiPrefill = {
  title: string;
  tagline: string;
  headline: string;
  badge: string;
  countLabel: string;
  category: "templates" | "ebooks" | "presets" | "audits";
  includes: string[];
  proof: string;
  proofName: string;
  price?: number;
  compareAt?: number;
};

const INSTRUCTIONS = `You help create product listing copy for CreatorDrop, an Indian digital store selling ready-to-post Instagram Reel / YouTube Shorts / TikTok bundles.

Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "title": "string - polished product title if needed",
  "tagline": "string - one short line under the title",
  "headline": "string - conversion headline",
  "badge": "string - short badge like Reel Bundle",
  "countLabel": "string - like 500+",
  "category": "templates|ebooks|presets|audits",
  "includes": ["6 short benefit bullets buyers get"],
  "proof": "string - short testimonial-style quote",
  "proofName": "string - Indian-sounding reviewer name",
  "price": number or null,
  "compareAt": number or null
}

Rules:
- Keep copy punchy, sales-oriented, faceless-creator friendly
- Includes should mention ready-to-post, no watermarks, instant delivery, lifetime updates when relevant
- Prefer category "templates" for reel bundles
- Prices in INR whole numbers if suggesting; otherwise null
- Do not invent fake download URLs`;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as PrefillBody;
    const title = body.title?.trim() ?? "";
    const extra = body.prompt?.trim() ?? "";

    if (title.length < 3) {
      return NextResponse.json(
        { success: false, error: "Enter a product title first" },
        { status: 400 },
      );
    }

    if (!process.env.DO_MODEL_ACCESS_KEY) {
      return NextResponse.json(
        { success: false, error: "DO_MODEL_ACCESS_KEY is not configured" },
        { status: 500 },
      );
    }

    const userPrompt = [
      `Product title: ${title}`,
      body.countLabel ? `Clip count hint: ${body.countLabel}` : null,
      body.price ? `Sale price hint: ₹${body.price}` : null,
      extra ? `Extra instructions: ${extra}` : null,
      "Generate the product listing JSON now.",
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await aiCompletions(defaultModel, [
      { role: "system", content: INSTRUCTIONS },
      { role: "user", content: userPrompt },
    ]);

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const parsed = parsePrefillJson(raw);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "AI returned invalid JSON. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error("AI prefill failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "AI prefill failed",
      },
      { status: 500 },
    );
  }
}

function parsePrefillJson(raw: string): ProductAiPrefill | null {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const data = JSON.parse(cleaned) as Partial<ProductAiPrefill>;
    if (!data.tagline || !data.headline || !Array.isArray(data.includes)) {
      return null;
    }

    const category =
      data.category === "ebooks" ||
      data.category === "presets" ||
      data.category === "audits"
        ? data.category
        : "templates";

    return {
      title: String(data.title ?? "").trim(),
      tagline: String(data.tagline).trim(),
      headline: String(data.headline).trim(),
      badge: String(data.badge ?? "Reel Bundle").trim() || "Reel Bundle",
      countLabel: String(data.countLabel ?? "100+").trim() || "100+",
      category,
      includes: data.includes
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 8),
      proof: String(data.proof ?? "").trim(),
      proofName: String(data.proofName ?? "Verified buyer").trim(),
      price:
        typeof data.price === "number" && Number.isFinite(data.price)
          ? data.price
          : undefined,
      compareAt:
        typeof data.compareAt === "number" && Number.isFinite(data.compareAt)
          ? data.compareAt
          : undefined,
    };
  } catch {
    return null;
  }
}
