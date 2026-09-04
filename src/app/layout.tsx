import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import CartLink from "@/components/CartLink";
import { CartProvider } from "@/components/CartContext";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Rainbow Sprouts",
  description: "Shop our products",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;

  return (
    <html lang="en">
      <body>
        <CartProvider>
          <header className="border-b border-line bg-panel">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-serif">Rainbow Sprouts</Link>
              <nav className="flex items-center gap-6 text-sm">
                <Link href="/orders" className="hover:text-brass">My orders</Link>
                <CartLink />
                {user?.isAdmin && <Link href="/admin" className="hover:text-brass">Admin</Link>}
                {user ? (
                  <>
                    <span className="text-subtle">Logged in as {user.email || user.phone}</span>
                    <LogoutButton />
                  </>
                ) : (
                  <Link href="/login" className="hover:text-brass">Login</Link>
                )}
              </nav>
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}