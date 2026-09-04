import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic"; // always read fresh product data

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <h1 className="text-2xl mb-2">Nothing here yet</h1>
        <p className="text-subtle">Add your first product from the admin panel.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl mb-8">Shop</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} description={p.description} price={p.price} imageUrl={p.imageUrl} />
        ))}
      </div>
    </div>
  );
}
