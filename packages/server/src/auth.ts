import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

export type AuthUser = {
  id: string;
  username: string;
};

const SESSION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashed: string,
): Promise<boolean> {
  return compare(password, hashed);
}

export async function signToken(
  user: AuthUser,
  secret: string,
): Promise<string> {
  return new SignJWT({ username: user.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(new TextEncoder().encode(secret));
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<AuthUser> {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  if (!payload.sub || typeof payload.username !== "string") {
    throw new Error("Invalid token payload");
  }
  return { id: payload.sub, username: payload.username };
}