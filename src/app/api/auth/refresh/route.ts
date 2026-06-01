import { NextResponse, type NextRequest } from "next/server";
import { rotateRefreshToken } from "@/services/auth.service";

export const runtime = "nodejs";

/** POST /api/auth/refresh { refreshToken } — rotate and return a new pair. */
export async function POST(req: NextRequest) {
  const { refreshToken } = (await req.json().catch(() => ({}))) as {
    refreshToken?: string;
  };
  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refreshToken" }, { status: 400 });
  }
  try {
    const tokens = await rotateRefreshToken(refreshToken);
    return NextResponse.json(tokens);
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
}
