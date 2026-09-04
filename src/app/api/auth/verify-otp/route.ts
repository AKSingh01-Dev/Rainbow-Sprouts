import { NextRequest, NextResponse } from "next/server";
import { normalizeIdentifier, verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { z } from "zod";

const schema = z.object({ identifier: z.string().trim().min(3), code: z.string().trim().length(6) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing identifier or code." }, { status: 400 });
  }
  const identifier = normalizeIdentifier(parsed.data.identifier);
  const { code } = parsed.data;

  const valid = await verifyOtp(identifier, code);
  if (!valid) {
    return NextResponse.json({ error: "That code is invalid or expired." }, { status: 401 });
  }

  const isEmail = identifier.includes("@");
  const user = await prisma.user.upsert({
    where: isEmail ? { email: identifier } : { phone: identifier },
    update: {},
    create: isEmail ? { email: identifier } : { phone: identifier },
  });

  const token = createSessionToken({ userId: user.id, isAdmin: user.isAdmin });
  setSessionCookie(token);

  return NextResponse.json({ ok: true, user: { id: user.id, isAdmin: user.isAdmin } });
}
