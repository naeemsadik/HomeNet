/**
 * AI Property Parser Service
 *
 * Calls Groq API (llama-3.3-70b-versatile) to extract structured property data
 * from a natural-language description. Uses raw fetch — no SDK dependency.
 *
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │ TODO: To switch to a backend endpoint, replace the fetch call below with:  │
 * │   apiClient.post("/v1/ai/parse-property", { description })                │
 * │ and return response.data as AiParsedProperty.                              │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */

import {
  type AiParsedProperty,
  AiParseError,
} from "../types/aiListing";

// ─── Constants ─────────────────────────────────────────────────────────────────

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are a property data extractor for a Bangladesh real estate platform.
Extract property details from the user's description and return ONLY a valid JSON object.
Use these exact keys (all optional):
- title (string)
- description (string, a polished marketing description)
- type: one of "residential", "commercial", "land", "parking"
- subtype: e.g. "apartment", "house", "duplex", "condo", "short-let", "penthouse", "studio", "office", "office-floor", "shop", "warehouse", "building", "residential-plot", "commercial-plot", "plot", "agricultural", "covered", "open", "garage"
- listingType: "sale" or "rent"
- price: number as string, in BDT (e.g. "18000000" for 1.8 crore)
- areaSize: number as string (e.g. "1800")
- areaUnit: one of "sqft", "katha", "bigha", "sqm"
- bedrooms: number as string
- bathrooms: number as string
- floor: number as string
- facing: direction string (e.g. "south", "north-east")
- address: full address string
- amenities: object where key is one of [parking, lift, generator, security, gas, pool, gym, rooftop, cctv, smart_home, servant_quarter, mosque, loading_dock, road_access, electricity, water, covered, ev_charging] and value is true
- confidence: object where key is the field name above and value is "high", "medium", or "low"

Rules:
- BDT conversions: 1 crore = 10000000, 1 lakh = 100000, 1 thousand = 1000
- Respond with JSON only. No explanation. No markdown fences. No extra text.`;

// ─── Allowed keys for validation ───────────────────────────────────────────────

const ALLOWED_KEYS = new Set<string>([
  "title",
  "description",
  "type",
  "subtype",
  "listingType",
  "price",
  "areaSize",
  "areaUnit",
  "bedrooms",
  "bathrooms",
  "floor",
  "facing",
  "address",
  "amenities",
  "confidence",
]);

// ─── Main export ───────────────────────────────────────────────────────────────

export async function parsePropertyWithAi(
  description: string,
): Promise<AiParsedProperty> {
  // TODO: swap fetch for apiClient.post("/v1/ai/parse-property", { description: text }) — the exact backend integration point
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!apiKey || apiKey === "your_key_here") {
    throw new AiParseError(
      "AI parsing is not configured. Please add your Groq API key.",
      "MISSING_API_KEY",
    );
  }

  // ── Call Groq API ──────────────────────────────────────────────────────────
  let response: Response;
  try {
    response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: description },
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });
  } catch (err) {
    throw new AiParseError(
      "Could not reach AI service. Check your internet connection.",
      "NETWORK_ERROR",
    );
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new AiParseError(
      `AI service returned an error (${response.status}). ${errorBody.slice(0, 200)}`,
      "INVALID_RESPONSE",
    );
  }

  // ── Parse API response ─────────────────────────────────────────────────────
  let body: any;
  try {
    body = await response.json();
  } catch {
    throw new AiParseError(
      "Received an unreadable response from AI service.",
      "INVALID_RESPONSE",
    );
  }

  const rawContent = body?.choices?.[0]?.message?.content;
  if (typeof rawContent !== "string") {
    throw new AiParseError(
      "AI returned an empty or invalid response. Please try again.",
      "INVALID_RESPONSE",
    );
  }

  // ── Parse the JSON content ─────────────────────────────────────────────────
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new AiParseError(
      "AI response was not valid JSON. Please rephrase and try again.",
      "BAD_JSON",
    );
  }

  // ── Validate & strip unknown keys ──────────────────────────────────────────
  const result: AiParsedProperty = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (ALLOWED_KEYS.has(key) && value !== null && value !== undefined) {
      (result as any)[key] = value;
    }
  }

  // Coerce numeric fields to strings (LLM sometimes returns numbers)
  for (const numField of ["price", "areaSize", "bedrooms", "bathrooms", "floor"] as const) {
    if (result[numField] !== undefined && typeof result[numField] !== "string") {
      (result as any)[numField] = String(result[numField]);
    }
  }

  return result;
}
