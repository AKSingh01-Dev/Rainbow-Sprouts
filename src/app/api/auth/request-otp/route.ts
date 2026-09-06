import { NextRequest, NextResponse } from "next/server";
import { issueOtp, normalizeIdentifier } from "@/lib/otp";
import { z } from "zod";

const schema = z.object({
  identifier: z.string().trim().min(3).refine((value) => !value.includes("@") || z.string().email().safeParse(value).success, {
    message: "Enter a valid phone number or email.",
  }),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid phone number or email." }, { status: 400 });
  }
  try {
    await issueOtp(normalizeIdentifier(parsed.data.identifier));
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not send code.";
    const status = message.includes("already sent recently") ? 429 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
