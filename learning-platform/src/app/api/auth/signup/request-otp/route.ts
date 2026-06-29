import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";
import { normalizeGhanaPhone } from "@/lib/phone";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import { issueOtp } from "@/lib/otp-store";
import { sendOtpSms } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: "Supabase auth is not configured yet." }, { status: 500 });
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.password !== parsed.data.confirmPassword) {
      return NextResponse.json({ error: "Password and confirm password do not match." }, { status: 400 });
    }

    const phone = normalizeGhanaPhone(parsed.data.phone);
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid Ghana mobile number." }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const username = parsed.data.username.toLowerCase().trim();

    const [{ data: byPhone }, { data: byUsername }] = await Promise.all([
      admin.from("profiles").select("id").eq("phone", phone).maybeSingle(),
      admin.from("profiles").select("id").eq("username", username).maybeSingle(),
    ]);

    if (byPhone) {
      return NextResponse.json(
        {
          error:
            "This number already has an account. Please sign in, or use reset password if you forgot your password.",
        },
        { status: 409 },
      );
    }

    if (byUsername) {
      return NextResponse.json({ error: "Username is already taken. Choose another username." }, { status: 409 });
    }

    const otp = issueOtp({
      phone,
      purpose: "signup",
      payload: {
        fullName: parsed.data.fullName.trim(),
        username,
        role: parsed.data.role,
        password: parsed.data.password,
      },
    });
    await sendOtpSms({ phone, otp, context: "signup" });

    return NextResponse.json({ message: "OTP sent successfully." });
  } catch {
    return NextResponse.json({ error: "Could not send OTP right now." }, { status: 500 });
  }
}
