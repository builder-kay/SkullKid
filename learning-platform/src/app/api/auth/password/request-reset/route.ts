import { NextResponse } from "next/server";
import { normalizeGhanaPhone } from "@/lib/phone";
import { passwordResetRequestSchema } from "@/lib/validators";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import { issueOtp } from "@/lib/otp-store";
import { sendOtpSms } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: "Supabase auth is not configured yet." }, { status: 500 });
    }

    const body = await request.json();
    const parsed = passwordResetRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const phone = normalizeGhanaPhone(parsed.data.phone);
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid Ghana mobile number." }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const { data: profile } = await admin.from("profiles").select("id").eq("phone", phone).maybeSingle();
    if (!profile?.id) {
      return NextResponse.json({ error: "No account found with this number." }, { status: 404 });
    }

    const otp = issueOtp({
      phone,
      purpose: "reset",
      payload: { userId: profile.id },
    });
    await sendOtpSms({ phone, otp, context: "reset" });

    return NextResponse.json({ message: "Reset OTP sent successfully." });
  } catch {
    return NextResponse.json({ error: "Could not request reset right now." }, { status: 500 });
  }
}
