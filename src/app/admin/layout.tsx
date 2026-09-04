export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
