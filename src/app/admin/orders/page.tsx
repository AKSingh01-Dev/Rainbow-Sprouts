"use client";

import { useEffect, useState } from "react";
import { formatPrice, formatDate } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  user: { name: string | null; phone: string | null; email: string | null };
  address: { line1: string; line2: string | null; city: string; state: string; pincode: string; phone: string };
  items: { id: string; quantity: number; product: { name: string } }[];
};

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");

  async function load() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    alert(`Failed to update status: ${data.error || res.status}`);
    return;
  }

  load();
}

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const buyer = `${o.user.name || ""} ${o.user.phone || ""} ${o.user.email || ""}`.toLowerCase();
    return buyer.includes(q) || o.items.some((i) => i.product.name.toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">Orders</h1>
        <input
          className="input max-w-xs"
          placeholder="Search buyer or product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Placed</th>
            <th>Buyer</th>
            <th>Products</th>
            <th>Delivery address</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((o) => (
            <tr key={o.id}>
              <td className="whitespace-nowrap">{formatDate(o.createdAt)}</td>
              <td>
                <div>{o.user.name || "—"}</div>
                <div className="text-xs text-subtle">{o.user.phone || o.user.email}</div>
              </td>
              <td>
                {o.items.map((i) => (
                  <div key={i.id}>{i.product.name} × {i.quantity}</div>
                ))}
              </td>
              <td className="text-xs">
                {o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ""}, {o.address.city}, {o.address.state} {o.address.pincode}
                <br />
                {o.address.phone}
              </td>
              <td>{formatPrice(o.totalAmount)}</td>
              <td>{o.paymentMethod === "cod" ? "COD" : "Online"}</td>
              <td>
                <select className="input py-1" value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <p className="text-subtle text-sm mt-6">No orders match.</p>}
    </div>
  );
}