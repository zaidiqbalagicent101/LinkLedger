import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

const orderStatusStyles: Record<OrderStatus, string> = {
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700",
  CONTENT_SUBMITTED: "border-violet-200 bg-violet-50 text-violet-700",
  REVISION_REQUESTED: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-green-200 bg-green-50 text-green-700",
  PUBLISHED: "border-green-200 bg-green-50 text-green-700",
  COMPLETED: "border-green-200 bg-green-50 text-green-700",
  CANCELLATION_REQUESTED: "border-amber-200 bg-amber-50 text-amber-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  AUTHORIZED: "border-blue-200 bg-blue-50 text-blue-700",
  PAID: "border-green-200 bg-green-50 text-green-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  REFUNDED: "border-gray-200 bg-gray-100 text-gray-600",
};

export function OrderStatusBadge({
  status,
  kind = "order",
}: {
  status: OrderStatus | PaymentStatus;
  kind?: "order" | "payment";
}) {
  const styles = kind === "payment"
    ? paymentStatusStyles[status as PaymentStatus]
    : orderStatusStyles[status as OrderStatus];

  return (
    <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${styles}`}>
      {status.toLowerCase().replaceAll("_", " ")}
    </span>
  );
}