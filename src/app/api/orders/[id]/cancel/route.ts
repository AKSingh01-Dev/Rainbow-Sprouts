import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const NON_CANCELLABLE_STATUSES = ["shipped", "delivered", "cancelled"];
const CANCEL_WINDOW_HOURS = 24;

// Customer only: cancel their own order, within 24 hours and before it ships.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.userId !== session.userId) {
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  }

  if (NON_CANCELLABLE_STATUSES.includes(order.status)) {
    return NextResponse.json(
      { error: `Order already ${order.status}, cannot cancel` },
      { status: 400 }
    );
  }

  const hoursSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceOrder > CANCEL_WINDOW_HOURS) {
    return NextResponse.json(
      { error: "Cancellation window (24 hours) has passed" },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: "cancelled" },
  });

  return NextResponse.json({ order: updated });
}