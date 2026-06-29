type OtpPurpose = "signup" | "reset";

type OtpRecord = {
  code: string;
  expiresAt: number;
  purpose: OtpPurpose;
  payload?: Record<string, string>;
};

const store = new Map<string, OtpRecord>();

function keyFor(phone: string, purpose: OtpPurpose) {
  return `${purpose}:${phone}`;
}

export function issueOtp({
  phone,
  purpose,
  payload,
}: {
  phone: string;
  purpose: OtpPurpose;
  payload?: Record<string, string>;
}) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 5 * 60 * 1000;
  store.set(keyFor(phone, purpose), { code, expiresAt, purpose, payload });
  return code;
}

export function verifyOtp({
  phone,
  purpose,
  code,
}: {
  phone: string;
  purpose: OtpPurpose;
  code: string;
}) {
  const key = keyFor(phone, purpose);
  const record = store.get(key);
  if (!record) return { ok: false as const, reason: "OTP not requested." };
  if (Date.now() > record.expiresAt) {
    store.delete(key);
    return { ok: false as const, reason: "OTP expired. Request a new code." };
  }
  if (record.code !== code) return { ok: false as const, reason: "Invalid OTP code." };
  return { ok: true as const, payload: record.payload };
}

export function clearOtp(phone: string, purpose: OtpPurpose) {
  store.delete(keyFor(phone, purpose));
}
