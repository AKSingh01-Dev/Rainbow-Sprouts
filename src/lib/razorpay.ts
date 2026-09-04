import Razorpay from "razorpay";
import crypto from "crypto";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

// Amount must be in paise (smallest INR unit).
export async function createRazorpayOrder(amountPaise: number, receipt: string) {
  return razorpay.orders.create({ amount: amountPaise, currency: "INR", receipt });
}

// Never trust a client-reported "payment succeeded" — always verify
// the signature server-side before marking an order paid.
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}
