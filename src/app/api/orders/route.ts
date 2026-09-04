import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const itemSchema = z.object({ productId: z.string(), quantity: z.number().int().positive() });
const createSchema = z.object({
  items: z.array(itemSchema).min(1),
  paymentMethod: z.enum(["online", "cod"]).default("online"),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(4),
    phone: z.string().min(6),
  }),
});

// Buyer: view their own orders. Admin: view every order (for the
// admin dashboard — buyer name/contact, products, delivery, timestamp).
export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: session.isAdmin ? {} : { userId: session.userId },
    include: { items: { include: { product: true } }, address: true, user: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

// Buyer: create a pending order before starting Razorpay checkout.
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { items, address } = parsed.data;

  const products = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } });
  const totalAmount = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error("Product not found");
    return sum + product.price * item.quantity;
  }, 0);

  const savedAddress = await prisma.address.create({ data: { ...address, userId: session.userId } });

    const order = await prisma.order.create({
    data: {
      userId: session.userId,
      addressId: savedAddress.id,
      totalAmount,
      status: "pending",
      paymentMethod: parsed.data.paymentMethod,
      items: {
        create: items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return { productId: item.productId, quantity: item.quantity, priceAtPurchase: product.price };
        }),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ order }, { status: 201 });
}
