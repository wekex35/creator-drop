/** Post-payment download links for digital packs. */
export const DEFAULT_DELIVERY_URL =
  "https://drive.google.com/drive/folders/16uOrH3NIPhikmrtUi54A4YUVNaHezXhB";

export const deliveryByProductId: Record<string, string> = {
  "ai-baby": DEFAULT_DELIVERY_URL,
  "mahadev-reels": DEFAULT_DELIVERY_URL,
  "nature-cinematic": DEFAULT_DELIVERY_URL,
  "yb-tools": DEFAULT_DELIVERY_URL,
  "ghibli-videos": DEFAULT_DELIVERY_URL,
  "aesthetic-reels": DEFAULT_DELIVERY_URL,
  "luxury-reels":
    "https://drive.google.com/file/d/1KRtJPPd0PoE5rA56KkJLNTT7FMp4a1Pi/view",
  "ai-god-reels": DEFAULT_DELIVERY_URL,
  "ai-english-reels": DEFAULT_DELIVERY_URL,
  "yb-reels": DEFAULT_DELIVERY_URL,
  "sanatan-reels": DEFAULT_DELIVERY_URL,
  "car-crash": DEFAULT_DELIVERY_URL,
  "ai-story-reels": DEFAULT_DELIVERY_URL,
  "business-tips-hindi": DEFAULT_DELIVERY_URL,
  "2d-animation": DEFAULT_DELIVERY_URL,
  timelapse: DEFAULT_DELIVERY_URL,
};

export function getDeliveryUrl(productId: string) {
  return deliveryByProductId[productId] ?? DEFAULT_DELIVERY_URL;
}
