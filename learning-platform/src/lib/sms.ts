import { hasSupabaseConfig } from "@/lib/supabase";

const ARKESEL_BASE_URL = process.env.ARKESEL_BASE_URL ?? "https://sms.arkesel.com/api/v2";

export async function sendOtpSms({
  phone,
  otp,
  context,
}: {
  phone: string;
  otp: string;
  context: "signup" | "reset";
}) {
  const apiKey = process.env.ARKESEL_API_KEY;
  const sender = process.env.ARKESEL_SENDER_ID ?? "AfriLearn";
  if (!apiKey) {
    throw new Error("Arkesel API key is missing.");
  }

  const message =
    context === "signup"
      ? `AfriLearn verification code: ${otp}. It expires in 5 minutes.`
      : `AfriLearn password reset code: ${otp}. It expires in 5 minutes.`;

  const response = await fetch(`${ARKESEL_BASE_URL}/sms/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      api_key: apiKey,
    },
    body: JSON.stringify({
      sender,
      message,
      recipients: [phone],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send OTP SMS: ${text}`);
  }
}

export function authDependenciesConfigured() {
  return hasSupabaseConfig() && Boolean(process.env.ARKESEL_API_KEY);
}
