type OtpPurpose = "signup" | "reset";

type OtpRecord = {
  expiresAt: number;
  purpose: OtpPurpose;
  payload?: Record<string, string>;
};

const store = new Map<string, OtpRecord>();

function keyFor(phone: string, purpose: OtpPurpose) {
  return `${purpose}:${phone}`;
}

export function saveOtpSession({
  phone,
  purpose,
  payload,
}: {
  phone: string;
  purpose: OtpPurpose;
  payload?: Record<string, string>;
}) {
  const expiresAt = Date.now() + 10 * 60 * 1000;
  store.set(keyFor(phone, purpose), { expiresAt, purpose, payload });
}

export function getOtpSession({
  phone,
  purpose,
}: {
  phone: string;
  purpose: OtpPurpose;
}) {
  const key = keyFor(phone, purpose);
  const record = store.get(key);
  if (!record) return { ok: false as const, reason: "OTP not requested." };
  if (Date.now() > record.expiresAt) {
    store.delete(key);
    return { ok: false as const, reason: "OTP expired. Request a new code." };
  }
  return { ok: true as const, payload: record.payload };
}

export function clearOtpSession(phone: string, purpose: OtpPurpose) {
  store.delete(keyFor(phone, purpose));
}
