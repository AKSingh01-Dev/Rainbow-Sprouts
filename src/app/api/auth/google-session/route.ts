import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return NextResponse.json({ error: "Google sign-in session not found." }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: session.user?.name || undefined },
    create: { email, name: session.user?.name || null, isAdmin: email === process.env.ADMIN_EMAIL?.toLowerCase() },
  });

  setSessionCookie(createSessionToken({ userId: user.id, isAdmin: user.isAdmin }));
  const next = new URL(req.url).searchParams.get("next");
  const destination = next?.startsWith("/") ? next : "/";
  return NextResponse.redirect(new URL(destination, req.url));
}