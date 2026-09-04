"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NON_CANCELLABLE_STATUSES = ["shipped", "delivered", "cancelled"];
const CANCEL_WINDOW_HOURS = 24;

type Props = {
  orderId: string;
  status: string;
  createdAt: string;
};

export default function CancelOrderButton({ orderId, status, createdAt }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hoursSinceOrder =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

  const canCancel =
    !NON_CANCELLABLE_STATUSES.includes(status) && hoursSinceOrder <= CANCEL_WINDOW_HOURS;

  if (!canCancel) return null;

  async function handleCancel() {
    if (!confirm("Cancel this order? This can't be undone.")) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not cancel order");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="text-xs text-rust underline disabled:opacity-50"
      >
        {loading ? "Cancelling…" : "Cancel order"}
      </button>
      {error && <p className="text-xs text-rust mt-1">{error}</p>}
    </div>
  );
}