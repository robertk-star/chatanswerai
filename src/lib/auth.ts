import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "coc_admin_session";

export function adminCookieName() {
  return COOKIE_NAME;
}

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "development-secret-change-me";
}

export function createAdminSessionToken() {
  const issuedAt = Date.now().toString();
  const payload = Buffer.from(JSON.stringify({ role: "admin", issuedAt })).toString("base64url");
  const signature = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token?: string) {
  if (!token || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
