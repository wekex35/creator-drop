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

const MEDIA_PUBLIC_BASE = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ||
  process.env.R2_PUBLIC_BASE_URL ||
  "https://store.creatordrop.in"
).replace(/\/$/, "");

/** Public CDN URL for the branded delivery PDF customers receive. */
export function getDeliveryPdfUrl(productId: string) {
  return `${MEDIA_PUBLIC_BASE}/creatordrop/deliveries/${productId}.pdf`;
}

/** @deprecated alias — customers receive the PDF, not the raw Drive folder. */
export const DEFAULT_DELIVERY_URL = getDeliveryPdfUrl("ai-baby");

export const deliveryByProductId: Record<string, string> = Object.fromEntries(
  Object.keys(contentByProductId).map((id) => [id, getDeliveryPdfUrl(id)]),
);

/** Post-payment download link (branded PDF on Cloudflare R2). */
export function getDeliveryUrl(productId: string) {
  return deliveryByProductId[productId] ?? getDeliveryPdfUrl(productId);
}
