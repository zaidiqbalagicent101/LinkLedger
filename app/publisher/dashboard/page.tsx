import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { requirePublisherProfile } from "@/lib/auth";

export default function PublisherDashboardPage() {
  return (
    <Suspense fallback={<div className="dashboard" />}>
      <PublisherDashboard />
    </Suspense>
  );
}

async function PublisherDashboard() {
  const user = await requirePublisherProfile();
  return <DashboardView user={user} />;
}