"use client";

import { useActionState } from "react";
import { LoaderCircle, ShieldOff, ShieldCheck } from "lucide-react";
import { updateUserStatusAction, type AdminActionState } from "@/lib/admin-actions";

export function AdminUserStatusForm({
  userId,
  status,
  isSelf,
}: {
  userId: string;
  status: "ACTIVE" | "INACTIVE";
  isSelf: boolean;
}) {
  const [state, action, pending] = useActionState<AdminActionState | undefined, FormData>(
    updateUserStatusAction,
    undefined,
  );
  const nextStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  return (
    <form className="admin-user-status-form" action={action}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="status" value={nextStatus} />
      {state?.message && <p className="form-error" role="alert">{state.message}</p>}
      <button className={nextStatus === "INACTIVE" ? "danger-button" : "primary-button"} type="submit" disabled={pending || isSelf}>
        {pending ? <LoaderCircle className="spinner" size={16} /> : nextStatus === "INACTIVE" ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
        <span>{isSelf ? "Your account" : nextStatus === "INACTIVE" ? "Deactivate account" : "Activate account"}</span>
      </button>
    </form>
  );
}