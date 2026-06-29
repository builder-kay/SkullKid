import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { JwtPayload } from "@/lib/jwt";
import { verifyToken } from "@/lib/jwt";

export const AUTH_COOKIE = "afralearn_token";

export async function getSessionFromCookie(): Promise<JwtPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function unauthorized(message = "You need to sign in first.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "You do not have access to this resource.") {
  return NextResponse.json({ error: message }, { status: 403 });
}
