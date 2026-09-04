import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { z } from "zod";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "ankit7779845484@gmail.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Amul8987singh";

const schema = z.object({
  identifier: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success || parsed.data.identifier.toLowerCase() !== ADMIN_EMAIL || parsed.data.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { isAdmin: true },
    create: { email: ADMIN_EMAIL, isAdmin: true, name: "Admin" },
  });

  const token = createSessionToken({ userId: user.id, isAdmin: true });
  setSessionCookie(token);

  return NextResponse.json({ ok: true, user: { id: user.id, isAdmin: true } });
}