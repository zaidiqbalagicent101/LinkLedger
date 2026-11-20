import { Suspense } from "react";
import { requireRole } from "@/lib/auth";

export default function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="workspace-page" />}>
      <ProtectedAdvertiserLayout>{children}</ProtectedAdvertiserLayout>
    </Suspense>
  );
}

async function ProtectedAdvertiserLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADVERTISER");
  return children;
}