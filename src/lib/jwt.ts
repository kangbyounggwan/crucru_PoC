import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export interface AccessTokenPayload {
  sub: string; // user id
  email: string | null;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string; // unique id, stored (hashed) in DB for revocation
  type: "refresh";
}

export function signAccessToken(userId: string, email: string | null): string {
  const payload: AccessTokenPayload = { sub: userId, email, type: "access" };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  });
}

export function signRefreshToken(userId: string): { token: string; jti: string } {
  const jti = crypto.randomUUID();
  const payload: RefreshTokenPayload = { sub: userId, jti, type: "refresh" };
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  });
  return { token, jti };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  if (decoded.type !== "access") throw new Error("Not an access token");
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  if (decoded.type !== "refresh") throw new Error("Not a refresh token");
  return decoded;
}

/** Hash a refresh token's jti before persisting, so a DB leak can't reissue tokens. */
export function hashToken(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
