import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = updateStatusSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!current) throw new Error("ORDER_NOT_FOUND");

      if (current.status !== "cancelled" && parsed.data.status === "cancelled") {
        const transitioned = await tx.order.updateMany({
          where: { id: params.id, status: current.status },
          data: { status: "cancelled" },
        });
        if (transitioned.count !== 1) throw new Error("ORDER_STATUS_CHANGED");

        for (const item of current.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      if (current.status === "cancelled" && parsed.data.status !== "cancelled") {
        for (const item of current.items) {
          const reserved = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (reserved.count !== 1) throw new Error("INSUFFICIENT_STOCK");
        }

        const transitioned = await tx.order.updateMany({
          where: { id: params.id, status: "cancelled" },
          data: { status: parsed.data.status },
        });
        if (transitioned.count !== 1) throw new Error("ORDER_STATUS_CHANGED");
        return tx.order.findUnique({ where: { id: params.id } });
      }

      return tx.order.update({
        where: { id: params.id },
        data: { status: parsed.data.status },
      });
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json({ error: "Not enough stock to reactivate this order." }, { status: 409 });
    }
    throw error;
  }
}