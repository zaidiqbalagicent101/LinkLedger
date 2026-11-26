import "server-only";

import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const orderIdSchema = z.string().cuid();

export async function GET(request: Request) {
  const user = await requireRole("ADVERTISER");
  if (!consumeRateLimit(`payment-status:${user.id}`, 30, 60_000)) {
    return Response.json({ message: "Too many status requests. Please wait and try again." }, { status: 429 });
  }

  const orderId = new URL(request.url).searchParams.get("orderId");
  const parsedOrderId = orderIdSchema.safeParse(orderId);
  if (!parsedOrderId.success) {
    return Response.json({ message: "Invalid order." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: parsedOrderId.data, advertiserId: user.id },
    select: { paymentStatus: true },
  });
  if (!order) return Response.json({ message: "Order not found." }, { status: 404 });

  return Response.json(
    { paymentStatus: order.paymentStatus },
    { headers: { "Cache-Control": "no-store" } },
  );
}