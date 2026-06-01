// Apple "Sign in with Apple" client secret (JWT) generator for Supabase.
//
// Usage:
//   node scripts/gen-apple-secret.mjs <TEAM_ID> <KEY_ID> <SERVICES_ID> <path-to-AuthKey.p8>
//
// Example:
//   node scripts/gen-apple-secret.mjs ABCDE12345 FGHIJ67890 io.crucru.web ./AuthKey_FGHIJ67890.p8
//
// Paste the printed JWT into Supabase → Auth → Providers → Apple → "Secret Key (for OAuth)".
// Apple secrets expire in max 6 months — regenerate before then.

import fs from "node:fs";
import jwt from "jsonwebtoken";

const [, , teamId, keyId, servicesId, p8Path] = process.argv;

if (!teamId || !keyId || !servicesId || !p8Path) {
  console.error(
    "usage: node scripts/gen-apple-secret.mjs <TEAM_ID> <KEY_ID> <SERVICES_ID> <path-to-AuthKey.p8>",
  );
  process.exit(1);
}

const privateKey = fs.readFileSync(p8Path, "utf8");
const now = Math.floor(Date.now() / 1000);

const token = jwt.sign(
  {
    iss: teamId,
    iat: now,
    exp: now + 60 * 60 * 24 * 180, // 180 days (Apple max is 6 months)
    aud: "https://appleid.apple.com",
    sub: servicesId,
  },
  privateKey,
  { algorithm: "ES256", keyid: keyId },
);

console.log(token);
