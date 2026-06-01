import { NextResponse, type NextRequest } from "next/server";
import { getProvider } from "@/providers";
import { callbackUri, signState } from "@/server/oauth";

export const runtime = "nodejs";

/** GET /api/auth/:provider — start the OAuth flow, redirect to the provider. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { provider: string } },
) {
  const provider = getProvider(params.provider);
  if (!provider) {
    return NextResponse.json(
      { error: `Unknown or disabled provider: ${params.provider}` },
      { status: 404 },
    );
  }

  const state = signState(provider.name);
  const url = provider.getAuthorizeUrl({
    redirectUri: callbackUri(provider.name),
    state,
  });
  return NextResponse.redirect(url);
}
