import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { signupOtpVerifySchema } from "@/lib/validators";
import { clearOtp, verifyOtp } from "@/lib/otp-store";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import { normalizeGhanaPhone } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: "Supabase auth is not configured yet." }, { status: 500 });
    }

    const body = await request.json();
    const parsed = signupOtpVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const phone = normalizeGhanaPhone(parsed.data.phone);
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid Ghana mobile number." }, { status: 400 });
    }

    const verification = verifyOtp({ phone, purpose: "signup", code: parsed.data.otp });
    if (!verification.ok || !verification.payload) {
      return NextResponse.json({ error: verification.reason }, { status: 400 });
    }

    const { fullName, username, role, password } = verification.payload;
    if (!fullName || !username || !role || !password) {
      return NextResponse.json({ error: "Signup session expired. Request OTP again." }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      phone,
      password,
      phone_confirm: true,
      user_metadata: {
        full_name: fullName,
        username,
        role,
      },
    });

    if (createError || !created.user) {
      return NextResponse.json({ error: createError?.message ?? "Could not create account." }, { status: 400 });
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: created.user.id,
      full_name: fullName,
      username,
      phone,
      role,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: "Could not create user profile." }, { status: 500 });
    }

    clearOtp(phone, "signup");
    const roleUpper = String(role).toUpperCase() as "STUDENT" | "TEACHER" | "ADMIN";
    const token = signToken({ userId: created.user.id, role: roleUpper, email: phone });

    const response = NextResponse.json({
      user: {
        userId: created.user.id,
        fullName,
        username,
        phone,
        role: roleUpper,
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
    return NextResponse.json({ error: "Could not verify OTP right now." }, { status: 500 });
  }
}
