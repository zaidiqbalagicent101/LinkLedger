import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { requireRole } from "@/lib/auth";

export default function AdvertiserDashboardPage() {
  return (
    <Suspense fallback={<div className="dashboard" />}>
      <AdvertiserDashboard />
    </Suspense>
  );
}

async function AdvertiserDashboard() {
  const user = await requireRole("ADVERTISER");
  return <DashboardView user={user} />;
}