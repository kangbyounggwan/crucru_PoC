import { Platform } from "react-native";

/**
 * Base URL of the shared auth backend (the Next.js `web/` app).
 *
 * - iOS simulator can reach the host machine via localhost.
 * - Android emulator must use 10.0.2.2 to reach the host's localhost.
 * - On a real device, set this to your machine's LAN IP or deployed URL.
 */
export const API_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";

/** Deep-link scheme the OAuth flow should return to (see app.json "scheme"). */
export const APP_SCHEME = "crucru";
