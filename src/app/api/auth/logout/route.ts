import { NextResponse, type NextRequest } from "next/server";
import { revokeRefreshToken } from "@/services/auth.service";

export const runtime = "nodejs";

/** POST /api/auth/logout { refreshToken } — revoke the refresh token. */
export async function POST(req: NextRequest) {
  const { refreshToken } = (await req.json().catch(() => ({}))) as {
    refreshToken?: string;
  };
  if (refreshToken) await revokeRefreshToken(refreshToken);
  return NextResponse.json({ ok: true });
}
