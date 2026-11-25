"use client";

import Image from "next/image";
import { useState } from "react";
import { Globe2 } from "lucide-react";

export function MarketplaceWebsitePreview({
  logoUrl,
  websiteName,
}: {
  logoUrl: string | null;
  websiteName: string;
}) {
  const [unavailable, setUnavailable] = useState(false);

  if (!logoUrl || unavailable) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,#e7f4ed,#dce8e2)] text-[#286d5d]">
        <Globe2 size={34} strokeWidth={1.5} />
        <span className="max-w-[80%] truncate text-sm font-semibold">{websiteName}</span>
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt={`${websiteName} logo`}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
      unoptimized
      onError={() => setUnavailable(true)}
      className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
    />
  );
}
