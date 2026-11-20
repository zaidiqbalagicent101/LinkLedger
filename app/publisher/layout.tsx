import { Suspense } from "react";
import { requireRole } from "@/lib/auth";

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="workspace-page" />}>
      <ProtectedPublisherLayout>{children}</ProtectedPublisherLayout>
    </Suspense>
  );
}

async function ProtectedPublisherLayout({ children }: { children: React.ReactNode }) {
  await requireRole("PUBLISHER");
  return children;
}