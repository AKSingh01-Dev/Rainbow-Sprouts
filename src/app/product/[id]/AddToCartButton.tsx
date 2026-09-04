"use client";

import { useCart } from "@/components/CartContext";
import { useState } from "react";

export default function AddToCartButton({
  product,
  disabled,
}: {
  product: { id: string; name: string; price: number; stock: number };
  disabled?: boolean;
}) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.productId === product.id)?.quantity || 0;
  const atLimit = inCart >= product.stock;

  return (
    <div>
      <button
        disabled={disabled || atLimit}
        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={() => {
          addItem({ productId: product.id, name: product.name, price: product.price, maxStock: product.stock });
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
      >
        {disabled ? "Out of stock" : atLimit ? "Max stock in cart" : added ? "Added" : "Add to cart"}
      </button>
      {inCart > 0 && <p className="text-sm text-subtle mt-2">{inCart} in your cart</p>}
    </div>
  );
}