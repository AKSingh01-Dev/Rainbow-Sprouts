import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);

// Guards every /admin page. Real product/order data is still checked
// again in each API route — this just keeps non-admins off the pages.
export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login?next=/admin", req.url));

  try {
    const { payload } = await jwtVerify(token, secret);
    if (!(payload as { isAdmin?: boolean }).isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login?next=/admin", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };