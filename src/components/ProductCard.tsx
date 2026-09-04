import Link from "next/link";
import { formatPrice } from "@/lib/format";

type Props = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
};

export default function ProductCard({ id, name, description, price, imageUrl }: Props) {
  return (
    <Link href={`/product/${id}`} className="card block hover:border-brass transition-colors">
      <div className="aspect-square bg-paper border border-line rounded mb-3 overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-subtle text-sm">No image</div>
        )}
      </div>
      <h3 className="text-base font-serif mb-1">{name}</h3>
      <p className="text-sm text-subtle line-clamp-2 mb-2">{description}</p>
      <p className="font-medium">{formatPrice(price)}</p>
    </Link>
  );
}