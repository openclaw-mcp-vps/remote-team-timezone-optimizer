import { createHmac, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE_NAME = "rtto_access";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf-8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf-8");
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  const pairs = signatureHeader.split(",").map((entry) => entry.trim());
  const map = new Map<string, string[]>();

  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (!key || !value) {
      continue;
    }

    const existing = map.get(key) ?? [];
    existing.push(value);
    map.set(key, existing);
  }

  const timestamp = map.get("t")?.[0];
  const signatures = map.get("v1") ?? [];

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf-8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");

  const signatureMatch = signatures.some((signature) => {
    try {
      const signatureBuffer = Buffer.from(signature, "hex");
      if (signatureBuffer.length !== expectedBuffer.length) {
        return false;
      }
      return timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch {
      return false;
    }
  });

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - Number.parseInt(timestamp, 10));
  const freshEnough = Number.isFinite(ageSeconds) && ageSeconds <= 5 * 60;

  return signatureMatch && freshEnough;
}

export function signAccessToken(email: string, secret: string, ttlHours = 24 * 30): string {
  const normalizedEmail = normalizeEmail(email);
  const payload = {
    email: normalizedEmail,
    exp: Date.now() + ttlHours * 60 * 60 * 1000,
    v: 1,
  };

  const payloadString = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadString);
  const signature = createHmac("sha256", secret).update(encodedPayload, "utf-8").digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token: string | undefined, secret: string): { email: string; exp: number } | null {
  if (!token || !secret) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = createHmac("sha256", secret).update(encodedPayload, "utf-8").digest("base64url");

  if (expected.length !== signature.length) {
    return null;
  }

  const valid = timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as { email: string; exp: number; v: number };
    if (!parsed.email || !parsed.exp || parsed.exp < Date.now()) {
      return null;
    }

    return {
      email: normalizeEmail(parsed.email),
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export function getSigningSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || "development-signing-secret";
}
