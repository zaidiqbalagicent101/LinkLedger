import Link from "next/link";
import { connection } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPaymentsPage() {
  await connection();
  await requireRole("ADMIN");
  const orders = await prisma.order.findMany({
    where: { razorpayOrderId: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      createdAt: true,
      paymentStatus: true,
      paymentAmount: true,
      paymentCurrency: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      razorpayRefundId: true,
      paymentFailureCode: true,
      paymentCapturedAt: true,
      paymentRefundedAt: true,
      advertiser: { select: { fullName: true, email: true } },
    },
  });

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-7 sm:py-10 lg:px-9">
      <div className="mb-7"><p className="eyebrow">Razorpay transactions</p><h1 className="mt-2 text-[30px] font-semibold">Payment transactions</h1></div>
      <div className="overflow-x-auto border border-[#e0e7e2] bg-white">
        <table className="w-full min-w-[1100px] border-collapse text-left text-[12px]">
          <thead><tr className="border-b bg-[#f8faf9] text-[#82918b]"><th className="px-4 py-3">Order</th><th className="px-4 py-3">Advertiser</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Razorpay IDs</th><th className="px-4 py-3">Dates</th></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[#edf1ee]">
                <td className="px-4 py-4"><Link className="font-mono text-[#286d5d]" href={`/advertiser/orders/${order.id}`}>{order.id}</Link></td>
                <td className="px-4 py-4"><span className="block font-semibold">{order.advertiser.fullName}</span><span className="text-[#82918b]">{order.advertiser.email}</span></td>
                <td className="px-4 py-4 font-semibold">{order.paymentAmount ? new Intl.NumberFormat("en", { style: "currency", currency: order.paymentCurrency || "INR", maximumFractionDigits: 2 }).format(order.paymentAmount / 100) : "—"}</td>
                <td className="px-4 py-4"><span className="font-semibold">{order.paymentStatus}</span>{order.paymentFailureCode && <span className="mt-1 block text-red-700">{order.paymentFailureCode}</span>}</td>
                <td className="px-4 py-4 font-mono"><span className="block">Order: {order.razorpayOrderId || "—"}</span><span className="block">Payment: {order.razorpayPaymentId || "—"}</span><span className="block">Refund: {order.razorpayRefundId || "—"}</span></td>
                <td className="px-4 py-4"><span className="block">Created: {order.createdAt.toLocaleString()}</span>{order.paymentCapturedAt && <span className="block">Captured: {order.paymentCapturedAt.toLocaleString()}</span>}{order.paymentRefundedAt && <span className="block">Refunded: {order.paymentRefundedAt.toLocaleString()}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
