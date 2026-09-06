import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { z } from "zod";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "ankit7779845484@gmail.com").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const schema = z.object({
  identifier: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!ADMIN_PASSWORD || !parsed.success || parsed.data.identifier.toLowerCase() !== ADMIN_EMAIL || parsed.data.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { isAdmin: true },
    create: { email: ADMIN_EMAIL, isAdmin: true, name: "Admin" },
  });

  try {
    setSessionCookie(createSessionToken({ userId: user.id, isAdmin: true }));
  } catch {
    return NextResponse.json({ error: "Login is temporarily unavailable." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, user: { id: user.id, isAdmin: true } });
}