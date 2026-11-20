import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function PublisherRegistrationPage() {
  return (
    <AuthShell role="publisher">
      <AuthForm mode="register" role="publisher" />
    </AuthShell>
  );
}