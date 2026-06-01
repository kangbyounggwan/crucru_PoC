import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors, radius } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

const categories = ["전체", "패션", "뷰티", "푸드", "테크"];
const lives = [
  { title: "오늘의 BATTLE LIVE", host: "HoneyBee", viewers: "1.2K" },
  { title: "심야 뷰티 셀렉", host: "PowerZ", viewers: "860" },
];
const tabs = [
  { key: "home", label: "Home", icon: "▤" },
  { key: "battle", label: "Battle", icon: "⚔" },
  { key: "store", label: "Store", icon: "▦" },
  { key: "my", label: "My", icon: "☺" },
];

export default function MainScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Top bar — login sits top-right */}
      <View style={styles.topbar}>
        <Text style={styles.logo}>Crucru</Text>
        <View style={styles.search}>
          <Text style={styles.searchText}>검색</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={({ pressed }) => [styles.loginBtn, pressed ? { opacity: 0.85 } : null]}
        >
          <Text style={styles.loginText}>로그인</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <LinearGradient
          colors={["#3a1c5e", "#b70051"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroBadge}>LIVE BATTLE</Text>
          <Text style={styles.heroTitle}>크루 배틀 시즌 12 오픈!</Text>
          <Text style={styles.heroSub}>지금 참여하고 잭팟의 주인공이 되어보세요</Text>
        </LinearGradient>

        {/* Jackpot */}
        <LinearGradient
          colors={["#7b2ff7", "#b70051"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.jackpot}
        >
          <Text style={styles.jackpotLabel}>CURRENT JACKPOT</Text>
          <Text style={styles.jackpotValue}>₩1,234,567</Text>
        </LinearGradient>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cats}
        >
          {categories.map((c, i) => (
            <View key={c} style={[styles.cat, i === 0 ? styles.catActive : null]}>
              <Text style={[styles.catText, i === 0 ? styles.catTextActive : null]}>{c}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Live streaming */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>라이브 스트리밍</Text>
          <Text style={styles.liveDot}>● LIVE</Text>
        </View>
        <View style={styles.liveRow}>
          {lives.map((l) => (
            <View key={l.title} style={styles.liveCard}>
              <LinearGradient
                colors={["#2a2440", "#b70051"]}
                style={styles.liveThumb}
              >
                <Text style={styles.liveTag}>LIVE</Text>
                <Text style={styles.liveViewers}>👁 {l.viewers}</Text>
              </LinearGradient>
              <Text style={styles.liveTitle} numberOfLines={1}>{l.title}</Text>
              <Text style={styles.liveHost}>{l.host}</Text>
            </View>
          ))}
        </View>

        {/* Top crew */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>금주 TOP 크루 ✨</Text>
        <View style={styles.crewRow}>
          {["HoneyBee", "PowerZ", "Gamer4", "L4b₩"].map((n, i) => (
            <View key={n} style={styles.crew}>
              <View style={[styles.crewAvatar, { backgroundColor: crewColors[i] }]}>
                <Text style={styles.crewRank}>{i + 1}</Text>
              </View>
              <Text style={styles.crewName} numberOfLines={1}>{n}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom tab bar */}
      <View style={styles.tabbar}>
        {tabs.map((t, i) => (
          <View key={t.key} style={styles.tab}>
            <Text style={[styles.tabIcon, i === 0 ? styles.tabActive : null]}>{t.icon}</Text>
            <Text style={[styles.tabLabel, i === 0 ? styles.tabActive : null]}>{t.label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const crewColors = ["#ff5c8a", "#7b2ff7", "#00b8a9", "#ffb703"];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pageBg },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logo: { fontSize: 22, fontWeight: "800", color: colors.brand },
  search: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: "#f0f0f3",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  searchText: { color: "#9a9aa2", fontSize: 14 },
  loginBtn: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: { color: "#f9f9fb", fontWeight: "700", fontSize: 14 },
  content: { paddingHorizontal: 16, paddingTop: 4 },
  hero: { borderRadius: radius.card, padding: 20, minHeight: 120, justifyContent: "center" },
  heroBadge: { color: "#ffd1e3", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  heroTitle: { color: colors.white, fontSize: 20, fontWeight: "800", marginTop: 6 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 6 },
  jackpot: {
    marginTop: 14,
    borderRadius: radius.card,
    padding: 18,
  },
  jackpotLabel: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  jackpotValue: { color: colors.white, fontSize: 28, fontWeight: "800", marginTop: 4 },
  cats: { gap: 8, paddingVertical: 16 },
  cat: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: "#f0f0f3" },
  catActive: { backgroundColor: colors.brand },
  catText: { fontSize: 14, fontWeight: "600", color: colors.muted },
  catTextActive: { color: colors.white },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.ink },
  liveDot: { color: colors.brand, fontSize: 12, fontWeight: "700" },
  liveRow: { flexDirection: "row", gap: 12 },
  liveCard: { flex: 1 },
  liveThumb: {
    aspectRatio: 1,
    borderRadius: 16,
    padding: 10,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  liveTag: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
    backgroundColor: colors.brand,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  liveViewers: { color: colors.white, fontSize: 12, fontWeight: "600" },
  liveTitle: { marginTop: 8, fontSize: 14, fontWeight: "700", color: colors.ink },
  liveHost: { marginTop: 2, fontSize: 12, color: colors.muted },
  crewRow: { flexDirection: "row", gap: 16, marginTop: 14 },
  crew: { alignItems: "center", width: 64 },
  crewAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  crewRank: { color: colors.white, fontSize: 18, fontWeight: "800" },
  crewName: { marginTop: 6, fontSize: 12, color: colors.ink },
  tabbar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    backgroundColor: colors.white,
    paddingVertical: 8,
  },
  tab: { flex: 1, alignItems: "center", gap: 2 },
  tabIcon: { fontSize: 18, color: "#b8b8c0" },
  tabLabel: { fontSize: 11, color: "#b8b8c0" },
  tabActive: { color: colors.brand },
});
