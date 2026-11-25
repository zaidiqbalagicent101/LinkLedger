import "server-only";

import { buyPublisherServiceAction } from "@/lib/purchase-actions";
import { consumeRateLimit } from "@/lib/rate-limit";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await requireRole("ADVERTISER");
  if (!consumeRateLimit(`payment-create:${user.id}`, 10, 60_000)) {
    return Response.json({ message: "Too many payment requests. Please wait and try again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null) as { serviceId?: string; idempotencyKey?: string } | null;
  if (!body?.serviceId || !body.idempotencyKey) {
    return Response.json({ message: "Invalid purchase request." }, { status: 400 });
  }

  const formData = new FormData();
  formData.set("serviceId", body.serviceId);
  formData.set("idempotencyKey", body.idempotencyKey);
  const result = await buyPublisherServiceAction(undefined, formData);
  if (result.checkout) return Response.json(result);
  return Response.json(result, { status: 409 });
}
