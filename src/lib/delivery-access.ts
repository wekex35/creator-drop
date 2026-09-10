import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  CREATORDROP_PREFIX,
  initMediaS3Client,
  MEDIA_BUCKET,
} from "@/lib/config/cloudflare";
import { getCashfreeReturnBaseUrl } from "@/lib/cashfree";

/** Object key for a pack delivery PDF (not publicly listed). */
export function deliveryPdfObjectKey(productId: string) {
  const id = productId.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  if (!id) throw new Error("Invalid product id");
  // Dedicated private bucket uses a short prefix; shared public bucket uses a deep path.
  if (process.env.R2_PRIVATE_BUCKET?.trim()) {
    return `deliveries/${id}.pdf`;
  }
  return `${CREATORDROP_PREFIX}/private/deliveries/${id}.pdf`;
}

export function privateDeliveryBucket() {
  return (
    process.env.R2_PRIVATE_BUCKET?.trim() ||
    process.env.R2_BUCKET?.trim() ||
    MEDIA_BUCKET
  );
}

function downloadSecret() {
  return (
    process.env.DOWNLOAD_TOKEN_SECRET?.trim() ||
    process.env.ADMIN_SECRET?.trim() ||
    ""
  );
}

type DownloadClaims = {
  o: string; // orderId
  p: string; // productId
  e: number; // expiry ms
};

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

function signPayload(payload: string) {
  const secret = downloadSecret();
  if (!secret) {
    throw new Error("DOWNLOAD_TOKEN_SECRET or ADMIN_SECRET is required");
  }
  return createHmac("sha256", secret).update(payload).digest();
}

/** Create a time-limited download token for a paid order item. */
export function createDownloadToken(input: {
  orderId: string;
  productId: string;
  ttlSeconds?: number;
}) {
  const ttl = input.ttlSeconds ?? 60 * 60 * 24; // 24h page link
  const claims: DownloadClaims = {
    o: input.orderId,
    p: input.productId,
    e: Date.now() + ttl * 1000,
  };
  const payload = b64url(JSON.stringify(claims));
  const sig = b64url(signPayload(payload));
  return `${payload}.${sig}`;
}

export function verifyDownloadToken(token: string): DownloadClaims | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  let expected: Buffer;
  try {
    expected = signPayload(payload);
  } catch {
    return null;
  }

  const got = fromB64url(sig);
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) {
    return null;
  }

  try {
    const claims = JSON.parse(fromB64url(payload).toString("utf8")) as DownloadClaims;
    if (!claims?.o || !claims?.p || !claims?.e) return null;
    if (Date.now() > claims.e) return null;
    return claims;
  } catch {
    return null;
  }
}

/** App URL that exchanges a token for a short-lived R2 signed URL. */
export function buildSecureDownloadUrl(orderId: string, productId: string) {
  const token = createDownloadToken({ orderId, productId });
  const base = getCashfreeReturnBaseUrl();
  return `${base}/api/download?token=${encodeURIComponent(token)}`;
}

/** Short-lived direct R2 GET URL (private object). */
export async function createDeliveryPdfSignedUrl(
  productId: string,
  expiresInSeconds = 60 * 15,
) {
  const key = deliveryPdfObjectKey(productId);
  const bucket = privateDeliveryBucket();
  const client = initMediaS3Client();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentType: "application/pdf",
      ResponseContentDisposition: `inline; filename="${productId}.pdf"`,
    }),
    { expiresIn: expiresInSeconds },
  );
}
