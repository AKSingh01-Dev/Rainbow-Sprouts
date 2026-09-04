import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) redirect("/login?next=/admin");
  if (!session.isAdmin) redirect("/");

  return (
    <div>
      <div className="flex gap-6 mb-8 border-b border-line pb-4 text-sm">
        <a href="/admin" className="hover:text-brass">Dashboard</a>
        <a href="/admin/products" className="hover:text-brass">Products</a>
        <a href="/admin/orders" className="hover:text-brass">Orders</a>
      </div>
      {children}
    </div>
  );
}
