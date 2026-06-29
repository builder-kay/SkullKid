export function normalizeGhanaPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("233") && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+233${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `+233${digits}`;
  }

  return null;
}

export function isLikelyPhone(input: string) {
  return /^\+?\d[\d\s-]{7,}$/.test(input.trim());
}
