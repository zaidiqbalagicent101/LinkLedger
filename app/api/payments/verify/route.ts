import "server-only";

import { requireRole } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { verifyPublisherPaymentAction } from "@/lib/purchase-actions";

export async function POST(request: Request) {
  const user = await requireRole("ADVERTISER");
  if (!consumeRateLimit(`payment-verify:${user.id}`, 20, 60_000)) {
    return Response.json({ message: "Too many verification requests. Please wait and try again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ message: "Invalid payment verification request." }, { status: 400 });

  const result = await verifyPublisherPaymentAction(body);
  if (result.success) return Response.json(result);
  if (result.pending) return Response.json(result, { status: 202 });
  return Response.json(result, { status: 400 });
}
