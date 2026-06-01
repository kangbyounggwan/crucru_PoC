import { NextResponse, type NextRequest } from "next/server";
import { completeOAuth } from "@/server/oauth";

export const runtime = "nodejs";

/** GET callback — Kakao / Google / Naver (response in query string). */
export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } },
) {
  const sp = req.nextUrl.searchParams;
  if (sp.get("error")) {
    return NextResponse.json(
      { error: `Provider error: ${sp.get("error")}` },
      { status: 400 },
    );
  }
  return completeOAuth({
    providerName: params.provider,
    code: sp.get("code"),
    state: sp.get("state"),
  });
}

/** POST callback — Apple (response_mode=form_post). */
export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } },
) {
  const form = await req.formData();
  return completeOAuth({
    providerName: params.provider,
    code: (form.get("code") as string) ?? null,
    state: (form.get("state") as string) ?? null,
  });
}
