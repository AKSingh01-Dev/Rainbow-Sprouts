import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatPrice, formatDate } from "@/lib/format";
import { redirect } from "next/navigation";
import CancelOrderButton from "@/components/CancelOrderButton";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-line text-ink",
  paid: "bg-teal/10 text-teal",
  shipped: "bg-brass/10 text-brassDark",
  delivered: "bg-teal/10 text-teal",
  cancelled: "bg-rust/10 text-rust",
};

export default async function OrdersPage() {
  const session = getSession();
  if (!session) redirect("/login?next=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: { include: { product: true } }, address: true },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="text-center py-24">
        <h1 className="text-2xl mb-2">No orders yet</h1>
        <a href="/" className="text-brass underline">Start shopping</a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl mb-6">Your orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-subtle">{formatDate(order.createdAt)}</p>
                <p className="font-medium">{formatPrice(order.totalAmount)}</p>
              </div>
              <div className="text-right">
                <span className={`status-pill ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                {order.paymentMethod === "cod" && (
                  <p className="text-xs text-subtle mt-1">Cash on Delivery</p>
                )}
                <CancelOrderButton
                  orderId={order.id}
                  status={order.status}
                  createdAt={order.createdAt.toISOString()}
                />
              </div>
            </div>
            <ul className="text-sm text-subtle mb-3">
              {order.items.map((item) => (
                <li key={item.id}>{item.product.name} × {item.quantity}</li>
              ))}
            </ul>
            <p className="text-xs text-subtle">
              Delivering to {order.address.line1}, {order.address.city}, {order.address.state} {order.address.pincode}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}