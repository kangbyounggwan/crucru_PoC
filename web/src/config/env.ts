import { z } from "zod";

// Next.js auto-loads .env / .env.local — no dotenv needed.

const schema = z.object({
  // Public URL of THIS app (used to build OAuth redirect_uri).
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  // Frontend page tokens are handed back to.
  FRONTEND_REDIRECT_URL: z
    .string()
    .url()
    .default("http://localhost:3000/auth/callback"),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.coerce.number().default(900), // 15m
  JWT_REFRESH_TTL: z.coerce.number().default(1_209_600), // 14d

  // Per-provider creds are optional; a provider is enabled only when present.
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),

  KAKAO_CLIENT_ID: z.string().optional().default(""),
  KAKAO_CLIENT_SECRET: z.string().optional().default(""),

  NAVER_CLIENT_ID: z.string().optional().default(""),
  NAVER_CLIENT_SECRET: z.string().optional().default(""),

  // Apple "Sign in with Apple": client secret is a JWT signed with a .p8 key.
  APPLE_CLIENT_ID: z.string().optional().default(""), // Services ID, e.g. io.crucru.web
  APPLE_TEAM_ID: z.string().optional().default(""),
  APPLE_KEY_ID: z.string().optional().default(""),
  APPLE_PRIVATE_KEY: z.string().optional().default(""), // contents of AuthKey_xxx.p8
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
