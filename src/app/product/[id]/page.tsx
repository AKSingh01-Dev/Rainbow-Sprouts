import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { notFound } from "next/navigation";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product || !product.active) notFound();

  return (
    <div className="grid sm:grid-cols-2 gap-10">
      <div className="aspect-square bg-paper border border-line rounded overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-subtle">No image</div>
        )}
      </div>
      <div>
        <h1 className="text-2xl mb-2">{product.name}</h1>
        <p className="text-lg font-medium mb-4">{formatPrice(product.price)}</p>
        <p className="text-subtle mb-6 whitespace-pre-wrap">{product.description}</p>
        <p className="text-sm text-subtle mb-4">Estimated delivery: 10 - 15 days</p>
        <p className="text-sm text-subtle mb-4">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
        <AddToCartButton product={{ id: product.id, name: product.name, price: product.price, stock: product.stock }} disabled={product.stock === 0} />
      </div>
    </div>
  );
}
