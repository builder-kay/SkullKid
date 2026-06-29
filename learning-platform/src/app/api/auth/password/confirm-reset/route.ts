import { NextResponse } from "next/server";
import { clearOtp, verifyOtp } from "@/lib/otp-store";
import { normalizeGhanaPhone } from "@/lib/phone";
import { passwordResetConfirmSchema } from "@/lib/validators";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: "Supabase auth is not configured yet." }, { status: 500 });
    }

    const body = await request.json();
    const parsed = passwordResetConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.newPassword !== parsed.data.confirmPassword) {
      return NextResponse.json({ error: "Password and confirm password do not match." }, { status: 400 });
    }

    const phone = normalizeGhanaPhone(parsed.data.phone);
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid Ghana mobile number." }, { status: 400 });
    }

    const verification = verifyOtp({ phone, purpose: "reset", code: parsed.data.otp });
    if (!verification.ok || !verification.payload?.userId) {
      return NextResponse.json({ error: verification.reason }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const { error } = await admin.auth.admin.updateUserById(verification.payload.userId, {
      password: parsed.data.newPassword,
    });

    if (error) {
      return NextResponse.json({ error: "Unable to reset password right now." }, { status: 500 });
    }

    clearOtp(phone, "reset");
    return NextResponse.json({ message: "Password reset successful. You can now sign in." });
  } catch {
    return NextResponse.json({ error: "Could not reset password right now." }, { status: 500 });
  }
}
