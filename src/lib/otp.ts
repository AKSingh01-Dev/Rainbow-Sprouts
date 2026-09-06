import { prisma } from "./prisma";

const OTP_TTL_MINUTES = 10;

function isEmail(identifier: string) {
  return identifier.includes("@");
}

export function normalizeIdentifier(identifier: string) {
  const normalized = identifier.trim();
  return isEmail(normalized) ? normalized.toLowerCase() : normalized;
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function issueOtp(identifier: string) {
  identifier = normalizeIdentifier(identifier);

  // Basic rate limit: block if a code was issued in the last 60s.
  const recent = await prisma.otpToken.findFirst({
    where: { identifier, createdAt: { gt: new Date(Date.now() - 60_000) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent) throw new Error("OTP already sent recently. Please wait before retrying.");

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  if (isEmail(identifier)) {
    await sendEmailOtp(identifier, code);
  } else {
    await sendSmsOtp(identifier, code);
  }

  await prisma.otpToken.create({ data: { identifier, code, expiresAt } });
}

export async function verifyOtp(identifier: string, code: string) {
  identifier = normalizeIdentifier(identifier);

  const token = await prisma.otpToken.findFirst({
    where: { identifier, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!token) return false;
  await prisma.otpToken.update({ where: { id: token.id }, data: { used: true } });
  return true;
}

// --- Delivery channels ---
// Swap these for real provider calls once you have API keys.

async function sendEmailOtp(email: string, code: string) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL as string,
    to: email,
    subject: "Your login code",
    text: `Your login code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
  });
  if (result.error) {
    throw new Error(`Email delivery failed: ${result.error.message}`);
  }
}

async function sendSmsOtp(phone: string, code: string) {
  // While your MSG91 SMS template is pending DLT approval, real delivery
  // will fail — this lets you keep testing locally in the meantime.
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n📱  OTP for ${phone}: ${code}\n`);
  }

  try {
    await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      signal: AbortSignal.timeout(8_000),
      headers: { "Content-Type": "application/json", authkey: process.env.MSG91_AUTH_KEY as string },
      body: JSON.stringify({
        template_id: process.env.MSG91_OTP_TEMPLATE_ID,
        mobile: phone,
        otp: code,
        sender: process.env.MSG91_SENDER_ID,
      }),
    });
  } catch (err) {
    if (process.env.NODE_ENV === "production") throw err;
    console.warn("SMS delivery failed (expected while awaiting DLT approval):", err);
  }
}
