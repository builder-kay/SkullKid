import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";
import { normalizeGhanaPhone } from "@/lib/phone";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import { saveOtpSession } from "@/lib/otp-store";
import { sendOtpSms } from "@/lib/sms";
import { signFlowToken } from "@/lib/flow-token";

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

    const [{ data: byPhone, error: byPhoneError }, { data: byUsername, error: byUsernameError }] = await Promise.all([
      admin.from("profiles").select("id").eq("phone", phone).maybeSingle(),
      admin.from("profiles").select("id").eq("username", username).maybeSingle(),
    ]);

    if (byPhoneError || byUsernameError) {
      const dbMessage = byPhoneError?.message ?? byUsernameError?.message ?? "Failed to read profiles table.";
      return NextResponse.json({ error: `Database check failed: ${dbMessage}` }, { status: 500 });
    }

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

    saveOtpSession({
      phone,
      purpose: "signup",
      payload: {
        fullName: parsed.data.fullName.trim(),
        username,
        role: parsed.data.role,
        password: parsed.data.password,
      },
    });
    await sendOtpSms({ phone, context: "signup" });

    const sessionToken = signFlowToken(
      {
        purpose: "signup",
        phone,
        fullName: parsed.data.fullName.trim(),
        username,
        role: parsed.data.role,
        password: parsed.data.password,
      },
      10,
    );

    return NextResponse.json({ message: "OTP sent successfully.", sessionToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send OTP right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
