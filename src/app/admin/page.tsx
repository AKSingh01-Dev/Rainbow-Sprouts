import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, orderCount, revenue] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.order.aggregate({ where: { status: "paid" }, _sum: { totalAmount: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-subtle mb-1">Active products</p>
          <p className="text-2xl font-serif">{productCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-subtle mb-1">Paid orders</p>
          <p className="text-2xl font-serif">{orderCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-subtle mb-1">Revenue</p>
          <p className="text-2xl font-serif">{formatPrice(revenue._sum.totalAmount || 0)}</p>
        </div>
      </div>
    </div>
  );
}
