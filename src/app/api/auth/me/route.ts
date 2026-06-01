import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/** GET /api/auth/me — current user (requires Bearer access token). */
export async function GET(req: NextRequest) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  let userId: string;
  try {
    userId = verifyAccessToken(header.slice("Bearer ".length)).sub;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, avatar_url, created_at")
    .eq("id", userId)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
