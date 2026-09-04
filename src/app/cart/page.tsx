"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/format";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <h1 className="text-2xl mb-2">Your cart is empty</h1>
        <Link href="/" className="text-brass underline">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl mb-6">Your cart</h1>
      <table className="mb-6">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId}>
              <td>{item.name}</td>
              <td>{formatPrice(item.price)}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  max={item.maxStock}
                  className="input w-20"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Math.max(1, Math.min(item.maxStock, Number(e.target.value))))}
                />
              </td>
              <td>{formatPrice(item.price * item.quantity)}</td>
              <td>
                <button className="text-rust text-sm" onClick={() => removeItem(item.productId)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium">Total: {formatPrice(total)}</p>
        <button className="btn-primary" onClick={() => router.push("/checkout")}>
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
