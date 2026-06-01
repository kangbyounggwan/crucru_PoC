import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { API_BASE_URL, APP_SCHEME } from "../config";
import { colors, radius } from "../theme";
import { AppleIcon, GoogleIcon, KakaoIcon, NaverIcon } from "../components/icons";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

type Social = {
  provider: "kakao" | "google" | "apple" | "naver";
  label: string;
  bg: string;
  fg: string;
  border?: string;
  icon: React.ReactNode;
};

const socials: Social[] = [
  { provider: "kakao", label: "카카오로 시작하기", bg: colors.kakao, fg: colors.ink, icon: <KakaoIcon /> },
  { provider: "google", label: "구글로 시작하기", bg: colors.white, fg: "#1a1a1a", border: colors.googleBorder, icon: <GoogleIcon /> },
  { provider: "apple", label: "Apple로 시작하기", bg: colors.ink, fg: "#f9f9fb", icon: <AppleIcon /> },
  { provider: "naver", label: "네이버로 시작하기", bg: colors.naver, fg: colors.white, icon: <NaverIcon /> },
];

export default function LoginScreen({ navigation }: Props) {
  const [busy, setBusy] = useState<string | null>(null);

  async function startLogin(provider: Social["provider"]) {
    try {
      setBusy(provider);
      const authUrl = `${API_BASE_URL}/api/auth/${provider}`;
      const returnUrl = `${APP_SCHEME}://auth/callback`;
      // Opens the provider flow in a secure in-app browser and waits for the
      // redirect back to the app scheme. (Backend must redirect to returnUrl
      // for mobile — see web/ FRONTEND_REDIRECT_URL / a mobile redirect param.)
      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);
      if (result.type === "success" && result.url) {
        const params = new URL(result.url).searchParams;
        const accessToken = params.get("access_token");
        // TODO: persist tokens (expo-secure-store) and navigate into the app.
        if (accessToken) navigation.navigate("Main");
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={["#f2f2f4", "#d9d9de"]}
          style={styles.heroBg}
        >
          <Image
            source={require("../../assets/mascot.png")}
            style={styles.mascot}
            resizeMode="contain"
          />
        </LinearGradient>
        <View style={styles.sticker}>
          <Text style={styles.stickerText}>WIN TOGETHER!</Text>
        </View>
      </View>

      {/* Brand */}
      <Text style={styles.title}>Crucru</Text>
      <Text style={styles.subtitle}>Crew. Battle. Win Together.</Text>
      <View style={styles.tags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>#트렌디한</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>#에너지넘치는</Text>
        </View>
      </View>

      {/* Social buttons */}
      <View style={styles.buttons}>
        {socials.map((s) => (
          <Pressable
            key={s.provider}
            onPress={() => startLogin(s.provider)}
            disabled={busy !== null}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: s.bg },
              s.border ? { borderWidth: 1, borderColor: s.border } : null,
              pressed ? { opacity: 0.85 } : null,
            ]}
          >
            <View style={styles.btnIcon}>{s.icon}</View>
            <Text style={[styles.btnText, { color: s.fg }]}>
              {busy === s.provider ? "연결 중…" : s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.line} />
      </View>

      <Pressable>
        <Text style={styles.emailLink}>이메일로 로그인</Text>
      </Pressable>

      {/* Seller CTA */}
      <Pressable
        style={({ pressed }) => [styles.sellerCta, pressed ? { opacity: 0.9 } : null]}
      >
        <Text style={styles.sellerText}>셀러로 시작하기</Text>
        <Text style={styles.sellerArrow}>→</Text>
      </Pressable>

      <Text style={styles.footnote}>★ 함께 만드는 승부, 함께 얻는 가치</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.pageBg },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 36, alignItems: "center" },
  heroWrap: { width: "100%", aspectRatio: 1, marginTop: 8 },
  heroBg: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  mascot: { width: "85%", height: "85%" },
  sticker: {
    position: "absolute",
    top: 10,
    right: 6,
    backgroundColor: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    transform: [{ rotate: "8deg" }],
  },
  stickerText: { color: "#f9f9fb", fontWeight: "800", fontSize: 13 },
  title: { marginTop: 22, fontSize: 40, fontWeight: "800", color: colors.brand },
  subtitle: { marginTop: 8, fontSize: 20, fontWeight: "600", color: colors.muted },
  tags: { flexDirection: "row", gap: 8, marginTop: 12 },
  tag: { backgroundColor: colors.tagBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill },
  tagText: { fontSize: 12, fontWeight: "600", color: colors.ink },
  buttons: { width: "100%", marginTop: 28, gap: 12 },
  btn: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnIcon: { position: "absolute", left: 20 },
  btnText: { fontSize: 16, fontWeight: "600" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20, width: "100%" },
  line: { flex: 1, height: 1, backgroundColor: "#e6e6ea" },
  dividerText: { fontSize: 15, color: colors.muted },
  emailLink: { fontSize: 16, color: colors.teal, fontWeight: "500" },
  sellerCta: {
    width: "100%",
    height: 60,
    marginTop: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sellerText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  sellerArrow: { position: "absolute", right: 22, color: colors.white, fontSize: 18 },
  footnote: { marginTop: 20, fontSize: 14, color: colors.muted },
});
