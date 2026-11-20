import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function AdvertiserRegistrationPage() {
  return (
    <AuthShell role="advertiser">
      <AuthForm mode="register" role="advertiser" />
    </AuthShell>
  );
}