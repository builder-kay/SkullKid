import jwt from "jsonwebtoken";

export type JwtPayload = {
  userId: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
