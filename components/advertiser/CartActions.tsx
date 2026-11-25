"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, ShoppingCart, Trash2 } from "lucide-react";
import {
  addAdvertiserCartItem,
  removeAdvertiserCartItem,
} from "@/lib/cart-actions";

export function AddToCartButton({
  serviceId,
  alreadyInCart,
  alreadyPurchased = false,
}: {
  serviceId: string;
  alreadyInCart: boolean;
  alreadyPurchased?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(alreadyInCart);
  const [message, setMessage] = useState<string>();

  function addToCart() {
    startTransition(async () => {
      setMessage(undefined);
      const result = await addAdvertiserCartItem(serviceId);
      if (!result.success) {
        setMessage(result.message ?? "Could not add this service to your cart.");
        return;
      }

      setAdded(true);
      router.refresh();
    });
  }

  const disabled = pending || added || alreadyPurchased;

  return (
    <div className="w-full">
      {message && (
        <p className="mb-2 text-xs text-[#b42318]" role="alert">
          {message}
        </p>
      )}
      <button
        className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
          added
            ? "border-[#bfdfcf] bg-[#edf7f1] text-[#16734e]"
            : "border-[#cfe0d5] bg-white text-[#0e7a5a] hover:bg-[#edf6f0]"
        } disabled:opacity-80`}
        type="button"
        onClick={addToCart}
        disabled={disabled}
      >
        {pending ? (
          <LoaderCircle className="animate-spin" size={16} />
        ) : added || alreadyPurchased ? (
          <Check size={16} />
        ) : (
          <ShoppingCart size={16} />
        )}
        {pending
          ? "Adding..."
          : alreadyPurchased
            ? "Already purchased"
            : added
              ? "In cart"
              : "Add to Cart"}
      </button>
    </div>
  );
}

export function RemoveFromCartButton({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  function removeFromCart() {
    startTransition(async () => {
      setMessage(undefined);
      const result = await removeAdvertiserCartItem(serviceId);
      if (!result.success) {
        setMessage(result.message ?? "Could not remove this cart item.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      {message && (
        <p className="mb-2 text-xs text-[#b42318]" role="alert">
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={removeFromCart}
        disabled={pending}
        aria-label="Remove from cart"
        title="Remove from cart"
        className="inline-flex size-10 items-center justify-center rounded-lg border border-[#e5eae8] text-[#718078] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
      >
        {pending ? (
          <LoaderCircle className="animate-spin" size={16} />
        ) : (
          <Trash2 size={16} />
        )}
      </button>
    </div>
  );
}