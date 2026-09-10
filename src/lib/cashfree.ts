import { Cashfree, CFEnvironment } from "cashfree-pg";

export function isCashfreeTestMode() {
  const appId = (process.env.CASHFREE_APP_ID || "").trim();
  // Cashfree sandbox app IDs are prefixed with TEST
  if (/^test/i.test(appId)) return true;

  const env = (process.env.CASHFREE_ENV || "").trim().toLowerCase();
  const publicMode = (
    process.env.NEXT_PUBLIC_CASHFREE_MODE || ""
  ).trim().toLowerCase();

  return env !== "production" || publicMode !== "production";
}

export function getCashfree() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    throw new Error("Cashfree credentials are not configured");
  }

  const env =
    process.env.CASHFREE_ENV === "production" && !/^test/i.test(appId)
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;

  return new Cashfree(env, appId, secretKey);
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
