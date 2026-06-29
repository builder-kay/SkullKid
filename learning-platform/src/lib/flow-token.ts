import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

type BaseFlowPayload = {
  phone: string;
  purpose: "signup" | "reset";
};

export function signFlowToken<T extends BaseFlowPayload>(payload: T, expiresInMinutes = 10) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${expiresInMinutes}m`,
  });
}

export function verifyFlowToken<T extends BaseFlowPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}
