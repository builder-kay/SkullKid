import { NextResponse } from "next/server";
import { normalizeGhanaPhone } from "@/lib/phone";
import { passwordResetRequestSchema } from "@/lib/validators";
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
    const parsed = passwordResetRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const phone = normalizeGhanaPhone(parsed.data.phone);
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid Ghana mobile number." }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (profileError) {
      return NextResponse.json({ error: `Database check failed: ${profileError.message}` }, { status: 500 });
    }
    if (!profile?.id) {
      return NextResponse.json({ error: "No account found with this number." }, { status: 404 });
    }

    saveOtpSession({
      phone,
      purpose: "reset",
      payload: { userId: profile.id },
    });
    await sendOtpSms({ phone, context: "reset" });

    const sessionToken = signFlowToken(
      {
        purpose: "reset",
        phone,
        userId: profile.id,
      },
      10,
    );

    return NextResponse.json({ message: "Reset OTP sent successfully.", sessionToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not request reset right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
