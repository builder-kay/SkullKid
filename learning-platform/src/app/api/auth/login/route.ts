import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { AUTH_COOKIE } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { getSupabaseAdminClient, getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";
import { isLikelyPhone, normalizeGhanaPhone } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: "Supabase auth is not configured yet." }, { status: 500 });
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const identifier = parsed.data.identifier.trim();
    const supabase = getSupabaseClient();
    const admin = getSupabaseAdminClient();

    let phone = identifier;
    if (isLikelyPhone(identifier)) {
      const normalized = normalizeGhanaPhone(identifier);
      if (!normalized) {
        return NextResponse.json({ error: "Enter a valid Ghana mobile number." }, { status: 400 });
      }
      phone = normalized;
    } else {
      const { data: profile, error } = await admin
        .from("profiles")
        .select("phone")
        .eq("username", identifier.toLowerCase())
        .maybeSingle();

      if (error || !profile?.phone) {
        return NextResponse.json({ error: "Account not found. Check username or number." }, { status: 404 });
      }
      phone = profile.phone;
    }

    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      phone,
      password: parsed.data.password,
    });

    if (signInError || !sessionData.user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("full_name, role, username, phone")
      .eq("id", sessionData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile setup is incomplete." }, { status: 500 });
    }

    const role = String(profile.role).toUpperCase() as "STUDENT" | "TEACHER" | "ADMIN";
    const token = signToken({ userId: sessionData.user.id, role, email: profile.phone });
    const response = NextResponse.json({
      user: {
        userId: sessionData.user.id,
        fullName: profile.full_name,
        phone: profile.phone,
        username: profile.username,
        role,
      },
    });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Something went wrong while signing in." }, { status: 500 });
  }
}
