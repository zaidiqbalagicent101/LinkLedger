import { Suspense } from "react";
import LandingPage from "@/components/LandingPage";
import { dashboardForRole, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

// export const instant = false;

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-busy="true" />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const user = await getCurrentUser();
  if (user) redirect(dashboardForRole(user.role));

  return <LandingPage />;
} 