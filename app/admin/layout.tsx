import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireRole } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="admin-layout" />}>
      <ProtectedAdminLayout>{children}</ProtectedAdminLayout>
    </Suspense>
  );
}

async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  return <AdminShell>{children}</AdminShell>;
}