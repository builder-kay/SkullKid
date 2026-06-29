import { NextResponse } from "next/server";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();

  if (!hasSupabaseConfig()) {
    return NextResponse.json({
      user: {
        id: session.userId,
        role: session.role,
        phone: session.email,
      },
    });
  }

  const admin = getSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, username, phone, role")
    .eq("id", session.userId)
    .maybeSingle();

  if (!profile) return unauthorized();

  return NextResponse.json({
    user: {
      id: profile.id,
      fullName: profile.full_name,
      username: profile.username,
      phone: profile.phone,
      role: String(profile.role).toUpperCase(),
    },
  });
}
