import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createRazorpayOrder } from "@/lib/razorpay";
import { z } from "zod";

const schema = z.object({ orderId: z.string() });

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const rpOrder = await createRazorpayOrder(order.totalAmount, order.id);
  await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rpOrder.id } });

  return NextResponse.json({ razorpayOrderId: rpOrder.id, amount: order.totalAmount });
}
