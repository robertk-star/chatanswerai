import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const CLIENT_COOKIE_NAME = "coc_client_session";

export type ClientSessionPayload = {
  userId: string;
  businessId: string;
  email: string;
  role: string;
  issuedAt: number;
};

export function clientCookieName() {
  return CLIENT_COOKIE_NAME;
}

function getClientSecret() {
  return process.env.CLIENT_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "development-client-secret-change-me";
}

export function hashClientPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyClientPassword(password: string, storedHash: string) {
  if (!password || !storedHash || !storedHash.includes(":")) return false;

  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const expected = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");

  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function createClientSessionToken(payload: Omit<ClientSessionPayload, "issuedAt">) {
  const body: ClientSessionPayload = {
    ...payload,
    issuedAt: Date.now(),
  };

  const encodedPayload = Buffer.from(JSON.stringify(body)).toString("base64url");
  const signature = createHmac("sha256", getClientSecret()).update(encodedPayload).digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyClientSessionToken(token?: string): ClientSessionPayload | null {
  if (!token || !token.includes(".")) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = createHmac("sha256", getClientSecret()).update(encodedPayload).digest("base64url");

  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as ClientSessionPayload;

    if (!payload.userId || !payload.businessId || !payload.email) return null;

    return payload;
  } catch {
    return null;
  }
}
