import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");

  stripeClient ??= new Stripe(secretKey, {
    maxNetworkRetries: 2,
    timeout: 20_000,
  });
  return stripeClient;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  return webhookSecret;
}

export function getAppBaseUrl() {
  const configuredUrl = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!configuredUrl) {
    if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
    throw new Error("APP_BASE_URL must be configured for Stripe Checkout.");
  }

  const url = new URL(configuredUrl);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("APP_BASE_URL must use HTTPS outside localhost.");
  }
  return url.origin;
}