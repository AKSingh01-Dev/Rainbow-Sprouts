"use client";

import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/format";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", pincode: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof typeof address, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function placeOrder() {
    setLoading(true);
    setError("");
    try {
      // 1. Create the order in our own database either way.
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          address,
          paymentMethod,
        }),
      });
      if (!orderRes.ok) {
        const data = await orderRes.json();
        if (orderRes.status === 401) {
          router.push("/login?next=/checkout");
          return;
        }
        throw new Error(data.error?.message || "Could not create order.");
      }
      const { order } = await orderRes.json();

      // Cash on Delivery: no payment gateway involved. The order stays
      // "pending" until cash is collected and you update its status.
      if (paymentMethod === "cod") {
        clear();
        router.push("/orders");
        return;
      }

      // 2. Online payment: create a matching Razorpay order.
      const rpRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const rp = await rpRes.json();

      // 3. Open Razorpay checkout widget.
      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rp.amount,
        currency: "INR",
        name: "Rainbow Sprouts",
        order_id: rp.razorpayOrderId,
        handler: async function (response: any) {
          // 4. Verify payment server-side before treating it as paid.
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            clear();
            router.push("/orders");
          } else {
            setError("Payment could not be verified. Contact support if you were charged.");
          }
        },
        prefill: { contact: address.phone },
        theme: { color: "#B4863B" },
      });
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid sm:grid-cols-2 gap-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div>
        <h1 className="text-2xl mb-6">Delivery address</h1>
        <div className="card space-y-3">
          <input className="input" placeholder="Address line 1" value={address.line1} onChange={(e) => updateField("line1", e.target.value)} />
          <input className="input" placeholder="Address line 2 (optional)" value={address.line2} onChange={(e) => updateField("line2", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="City" value={address.city} onChange={(e) => updateField("city", e.target.value)} />
            <input className="input" placeholder="State" value={address.state} onChange={(e) => updateField("state", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Pincode" value={address.pincode} onChange={(e) => updateField("pincode", e.target.value)} />
            <input className="input" placeholder="Contact phone" value={address.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>
        </div>

        <h2 className="text-lg mt-6 mb-3">Payment method</h2>
        <div className="card space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
            <span>Pay online (card / UPI / netbanking)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
            <span>Cash on Delivery</span>
          </label>
        </div>
      </div>
      <div>
        <h1 className="text-2xl mb-6">Order summary</h1>
        <div className="card mb-4">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between py-1 text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-3 border-t border-line font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <p className="text-sm text-subtle mb-3">Estimated delivery: 10 - 15 days</p>
        {error && <p className="text-rust text-sm mb-3">{error}</p>}
        <button className="btn-primary w-full" disabled={loading} onClick={placeOrder}>
          {loading ? "Processing…" : paymentMethod === "cod" ? "Place order (Cash on Delivery)" : `Pay ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  );
}