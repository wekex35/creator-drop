/** Google Drive / Mega content links shown inside delivery PDFs. */
export const DEFAULT_CONTENT_URL =
  "https://drive.google.com/drive/folders/16uOrH3NIPhikmrtUi54A4YUVNaHezXhB";

export const contentByProductId: Record<string, string> = {
  "ai-baby": DEFAULT_CONTENT_URL,
  "mahadev-reels": DEFAULT_CONTENT_URL,
  "nature-cinematic": DEFAULT_CONTENT_URL,
  "yb-tools": DEFAULT_CONTENT_URL,
  "ghibli-videos": DEFAULT_CONTENT_URL,
  "aesthetic-reels": DEFAULT_CONTENT_URL,
  "luxury-reels":
    "https://drive.google.com/file/d/1KRtJPPd0PoE5rA56KkJLNTT7FMp4a1Pi/view",
  "ai-god-reels": DEFAULT_CONTENT_URL,
  "ai-english-reels": DEFAULT_CONTENT_URL,
  "yb-reels": DEFAULT_CONTENT_URL,
  "sanatan-reels": DEFAULT_CONTENT_URL,
  "car-crash": DEFAULT_CONTENT_URL,
  "ai-story-reels": DEFAULT_CONTENT_URL,
  "business-tips-hindi": DEFAULT_CONTENT_URL,
  "2d-animation": DEFAULT_CONTENT_URL,
  timelapse: DEFAULT_CONTENT_URL,
  "hulk-comedy-pack": DEFAULT_CONTENT_URL,
};

export function getContentDownloadUrl(productId: string) {
  return contentByProductId[productId] ?? DEFAULT_CONTENT_URL;
}

/**
 * Marker stored on products / order line items.
 * Real download URLs are minted only after payment via /api/download.
 */
export const PRIVATE_DELIVERY_MARKER = "private:r2-pdf";

/** @deprecated public CDN delivery — kept only for old data cleanup detection */
export function isPublicCdnDeliveryUrl(url: string) {
  return /\/creatordrop\/deliveries\/[^/?#]+\.pdf/i.test(url);
}

export function getDeliveryUrl(_productId: string) {
  return PRIVATE_DELIVERY_MARKER;
}

export const deliveryByProductId: Record<string, string> = Object.fromEntries(
  Object.keys(contentByProductId).map((id) => [id, PRIVATE_DELIVERY_MARKER]),
);

export const DEFAULT_DELIVERY_URL = PRIVATE_DELIVERY_MARKER;
