import { hasSupabaseConfig } from "@/lib/supabase";

const CLIFZE_BASE_URL = process.env.CLIFZE_BASE_URL ?? "https://clifze.shop/api/v1";

async function postClifzeOtpSend({
  apiKey,
  phone,
  message,
  expiry,
  sender,
}: {
  apiKey: string;
  phone: string;
  message: string;
  expiry: string;
  sender?: string;
}) {
  const body = new URLSearchParams({
    api_key: apiKey,
    recipient: phone,
    message,
    expiry,
  });
  if (sender) body.set("sender_id", sender);

  const response = await fetch(`${CLIFZE_BASE_URL}/otp/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json().catch(() => null)) as { status?: string; message?: string } | null;
  return { response, data };
}

export async function sendOtpSms({
  phone,
  context,
}: {
  phone: string;
  context: "signup" | "reset";
}) {
  const apiKey = process.env.CLIFZE_API_KEY;
  const sender = process.env.CLIFZE_SENDER_ID;
  const expiry = process.env.CLIFZE_OTP_EXPIRY_MIN ?? "10";
  if (!apiKey) {
    throw new Error("Clifze API key is missing.");
  }

  const message =
    context === "signup"
      ? "Your AfriLearn signup code is [otp]"
      : "Your AfriLearn password reset code is [otp]";

  const firstTry = await postClifzeOtpSend({
    apiKey,
    phone,
    message,
    expiry,
    sender: sender || undefined,
  });

  if (firstTry.response.ok && firstTry.data?.status === "success") {
    return;
  }

  // Fallback to default sender when custom sender_id fails/not approved.
  if (sender) {
    const secondTry = await postClifzeOtpSend({
      apiKey,
      phone,
      message,
      expiry,
    });
    if (secondTry.response.ok && secondTry.data?.status === "success") {
      return;
    }
    throw new Error(secondTry.data?.message ?? firstTry.data?.message ?? "Failed to send OTP SMS with Clifze.");
  }

  throw new Error(firstTry.data?.message ?? "Failed to send OTP SMS with Clifze.");
}

export async function verifyOtpSms({ phone, otpCode }: { phone: string; otpCode: string }) {
  const apiKey = process.env.CLIFZE_API_KEY;
  if (!apiKey) {
    throw new Error("Clifze API key is missing.");
  }

  const body = new URLSearchParams({
    api_key: apiKey,
    recipient: phone,
    otp_code: otpCode,
  });

  const response = await fetch(`${CLIFZE_BASE_URL}/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = (await response.json().catch(() => null)) as { status?: string; message?: string } | null;
  if (!response.ok || data?.status !== "success") {
    return { ok: false as const, reason: data?.message ?? "OTP verification failed." };
  }
  return { ok: true as const };
}

export function authDependenciesConfigured() {
  return hasSupabaseConfig() && Boolean(process.env.CLIFZE_API_KEY);
}
