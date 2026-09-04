"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function CartLink() {
  const { itemCount } = useCart();
  return (
    <Link href="/cart" className="hover:text-brass">
      Cart{itemCount > 0 ? ` (${itemCount})` : ""}
    </Link>
  );
}