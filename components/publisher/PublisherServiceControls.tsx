"use client";

import { useFormStatus } from "react-dom";
import { Archive, Power } from "lucide-react";
import {
  archivePublisherServiceAction,
  setPublisherServiceActiveAction,
} from "@/lib/publisher-service-actions";

function PendingButton({ children, className }: { children: React.ReactNode; className: string }) {
  const { pending } = useFormStatus();
  return <button className={className} type="submit" disabled={pending}>{children}</button>;
}

export function PublisherServiceControls({
  websiteId,
  serviceId,
  isActive,
}: {
  websiteId: string;
  serviceId: string;
  isActive: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={setPublisherServiceActiveAction}>
        <input type="hidden" name="websiteId" value={websiteId} />
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="active" value={String(!isActive)} />
        <PendingButton className="secondary-button min-h-10 text-[12px]">
          <Power size={15} />
          {isActive ? "Deactivate" : "Activate"}
        </PendingButton>
      </form>

      <form
        action={archivePublisherServiceAction}
        onSubmit={(event) => {
          if (!window.confirm("Delete this service from your active services? Historical references will be preserved.")) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="websiteId" value={websiteId} />
        <input type="hidden" name="serviceId" value={serviceId} />
        <PendingButton className="danger-button">
          <Archive size={15} />
          Delete service
        </PendingButton>
      </form>
    </div>
  );
}