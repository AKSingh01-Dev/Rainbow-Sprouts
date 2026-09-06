import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "session";

export type SessionPayload = { userId: string; isAdmin: boolean };

export function createSessionToken(payload: SessionPayload) {
  if (!SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getSession(): SessionPayload | null {
  if (!SECRET) return null;
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}
