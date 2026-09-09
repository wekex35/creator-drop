import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "creatordrop_admin";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const value = process.env.ADMIN_SECRET;
  if (!value) throw new Error("ADMIN_SECRET is not configured");
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "",
  };
}

export function verifyAdminPassword(username: string, password: string) {
  const creds = getAdminCredentials();
  if (!creds.password) return false;
  if (username !== creds.username) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(creds.password);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createAdminSessionToken() {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [sub, expRaw, sig] = parts;
  if (sub !== "admin") return false;
  const exp = Number(expRaw);
  if (!exp || Date.now() > exp) return false;
  const payload = `${sub}.${expRaw}`;
  const expected = sign(payload);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function setAdminSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearAdminSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return isValidAdminSessionToken(jar.get(COOKIE)?.value);
}

export { COOKIE as ADMIN_COOKIE_NAME, MAX_AGE_SEC as ADMIN_SESSION_MAX_AGE };
