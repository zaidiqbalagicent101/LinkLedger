import "server-only";

import crypto from "node:crypto";
import Razorpay from "razorpay";

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return { keyId, keySecret, webhookSecret };
}

export function getRazorpayClient() {
  const { keyId, keySecret } = getRazorpayConfig();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function toMinorUnits(amount: string | number, currency: string): number {
  const normalizedCurrency = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
    throw new Error("Invalid currency.");
  }

  const zeroDecimal = new Set(["JPY", "KRW"]);
  const threeDecimal = new Set(["BHD", "IQD", "JOD", "KWD", "LYD", "OMR", "TND"]);
  const decimals = zeroDecimal.has(normalizedCurrency) ? 0 : threeDecimal.has(normalizedCurrency) ? 3 : 2;
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid payment amount.");
  }

  const minor = Math.round(value * 10 ** decimals);
  if (!Number.isSafeInteger(minor) || minor > 999999999) {
    throw new Error("Payment amount is outside the supported range.");
  }
  return minor;
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const { keySecret } = getRazorpayConfig();
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const provided = Buffer.from(signature, "utf8");
  const actual = Buffer.from(expected, "utf8");
  return provided.length === actual.length && crypto.timingSafeEqual(provided, actual);
}

export function verifyWebhookSignature(rawBody: string | Uint8Array, signature: string | null): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !signature) return false;

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const provided = Buffer.from(signature, "utf8");
  const actual = Buffer.from(expected, "utf8");
  return provided.length === actual.length && crypto.timingSafeEqual(provided, actual);
}

export function logPaymentEvent(event: string, details: Record<string, unknown>) {
  console.log(JSON.stringify({ event, service: "linkledger-payments", timestamp: new Date().toISOString(), ...details }));
}
