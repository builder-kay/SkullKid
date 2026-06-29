import { NextResponse } from "next/server";
import { clearOtpSession, getOtpSession } from "@/lib/otp-store";
import { normalizeGhanaPhone } from "@/lib/phone";
import { passwordResetConfirmSchema } from "@/lib/validators";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import { verifyOtpSms } from "@/lib/sms";
import { verifyFlowToken } from "@/lib/flow-token";

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

    const otpVerification = await verifyOtpSms({ phone, otpCode: parsed.data.otp });
    if (!otpVerification.ok) {
      return NextResponse.json({ error: otpVerification.reason }, { status: 400 });
    }

    const tokenPayload = parsed.data.sessionToken
      ? verifyFlowToken<{
          purpose: "reset";
          phone: string;
          userId: string;
        }>(parsed.data.sessionToken)
      : null;

    const memorySession = getOtpSession({ phone, purpose: "reset" });
    const userId =
      tokenPayload && tokenPayload.purpose === "reset" && tokenPayload.phone === phone
        ? tokenPayload.userId
        : memorySession.ok
          ? memorySession.payload?.userId
          : null;

    if (!userId) {
      return NextResponse.json({ error: "Reset session expired. Request OTP again." }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: parsed.data.newPassword,
    });

    if (error) {
      return NextResponse.json({ error: "Unable to reset password right now." }, { status: 500 });
    }

    clearOtpSession(phone, "reset");
    return NextResponse.json({ message: "Password reset successful. You can now sign in." });
  } catch {
    return NextResponse.json({ error: "Could not reset password right now." }, { status: 500 });
  }
}
