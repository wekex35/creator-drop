/** Turn Cashfree / gateway junk into a clean shopper-facing message. */
export function friendlyPaymentError(raw: unknown): string {
  const text = extractRawMessage(raw).trim();
  if (!text) return "Payment failed. Please try again.";

  const parsed = tryParseJsonMessage(text);
  const code = (parsed?.code || "").toLowerCase();
  const message = (parsed?.message || text).trim();
  const haystack = `${code} ${message}`.toLowerCase();

  if (
    haystack.includes("payment_session_id") ||
    code === "payment_session_id_invalid"
  ) {
    return "Payment session expired or invalid. Please try checkout again.";
  }

  if (haystack.includes("authentication") || haystack.includes("unauthorized")) {
    return "Payment gateway authentication failed. Please try again later.";
  }

  if (
    haystack.includes("return_url") &&
    (haystack.includes("https") || haystack.includes("url should"))
  ) {
    return "Checkout is misconfigured (return URL). Please contact support.";
  }

  if (
    haystack.includes("cancelled") ||
    haystack.includes("canceled") ||
    haystack.includes("user_dropped") ||
    haystack.includes("closed")
  ) {
    return "Checkout was cancelled. You can try again anytime.";
  }

  if (haystack.includes("network") || haystack.includes("timeout")) {
    return "Network issue during payment. Check your connection and try again.";
  }

  // Never show raw JSON blobs to shoppers
  if (text.startsWith("{") || text.startsWith("[")) {
    return "Payment could not be completed. Please try again.";
  }

  // Strip noisy prefixes / codes
  const cleaned = message
    .replace(/^request_failed[:\s-]*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length > 160) {
    return "Payment could not be completed. Please try again.";
  }

  return cleaned || "Payment failed. Please try again.";
}

function extractRawMessage(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw instanceof Error) return raw.message;
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as {
      message?: unknown;
      error?: unknown;
      response?: { data?: { message?: unknown; code?: unknown } };
    };
    if (typeof obj.response?.data?.message === "string") {
      return obj.response.data.message;
    }
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    try {
      return JSON.stringify(raw);
    } catch {
      return "";
    }
  }
  return "";
}

function tryParseJsonMessage(text: string): {
  message?: string;
  code?: string;
  type?: string;
} | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as {
      message?: string;
      code?: string;
      type?: string;
    };
  } catch {
    return null;
  }
}
