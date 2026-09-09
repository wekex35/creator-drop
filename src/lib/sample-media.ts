/** Extract embeddable media ids from sample URLs. */

const PIN_PAGE_RE =
  /(?:^https?:\/\/)?(?:[a-z]+\.)?pinterest\.[^/]+\/pin\/(\d{6,})\/?/i;
const PIN_EMBED_RE =
  /assets\.pinterest\.com\/ext\/embed\.html\?[^"'#\s]*\bid=(\d{6,})/i;
const PIN_ID_PARAM_RE = /[?&]id=(\d{6,})/i;

export function extractPinId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{6,}$/.test(trimmed)) return trimmed;

  const fromPage = trimmed.match(PIN_PAGE_RE);
  if (fromPage) return fromPage[1];

  const fromEmbed = trimmed.match(PIN_EMBED_RE);
  if (fromEmbed) return fromEmbed[1];

  // Raw iframe HTML paste
  if (/<iframe/i.test(trimmed)) {
    const fromIframe = trimmed.match(PIN_EMBED_RE) || trimmed.match(PIN_ID_PARAM_RE);
    if (fromIframe) return fromIframe[1];
  }

  return null;
}

export function pinEmbedSrc(pinId: string) {
  return `https://assets.pinterest.com/ext/embed.html?id=${encodeURIComponent(pinId)}`;
}

export function isPinSample(value: string) {
  return extractPinId(value) != null;
}
