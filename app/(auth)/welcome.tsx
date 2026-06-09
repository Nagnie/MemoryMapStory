import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const ACCENT = "#e07a5f";
const ACCENT_INK = "#b85540";
const PAPER = "#f0e6d8";
const MAP_BG = "#e2d3c0";
const INK = "#2a1e14";
const INK_SOFT = "#7a604d";
const INK_FAINT = "rgba(42, 30, 20, 0.50)";

const SCREEN_H = Dimensions.get("window").height;

const PINS = [
  { top: 80, left: 28, size: 68, bg: "#d4a574", rot: "-7deg", emoji: "🌅" },
  { top: 130, right: 48, size: 56, bg: "#7ab8c4", rot: "5deg", emoji: "🌊" },
  { top: 210, left: 68, size: 50, bg: "#8fa87a", rot: "-3deg", emoji: "🌿" },
  { top: 190, right: 22, size: 44, bg: "#c4a87a", rot: "9deg", emoji: "⛰️" },
  { top: 300, left: 26, size: 44, bg: "#b48090", rot: "4deg", emoji: "🏙️" },
  { top: 285, right: 58, size: 50, bg: "#94b494", rot: "-6deg", emoji: "☕" },
];

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      {/* Decorative map area */}
      <View style={styles.mapArea}>
        {PINS.map((p, i) => (
          <View
            key={i}
            style={[
              styles.pin,
              {
                top: p.top,
                left: "left" in p ? p.left : undefined,
                right: "right" in p ? p.right : undefined,
                width: p.size,
                height: p.size,
                transform: [{ rotate: p.rot }],
              },
            ]}
          >
            <View style={[styles.pinPhoto, { backgroundColor: p.bg }]}>
              <Text style={styles.pinEmoji}>{p.emoji}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Content card that slides up over the map */}
      <View style={styles.contentCard}>
        <View style={styles.brandMark}>
          <Ionicons name="location" size={26} color="#fff" />
        </View>
        <Text style={styles.kicker}>Memory Map · For Two</Text>
        <Text style={styles.title}>
          Every place{"\n"}we've{" "}
          <Text style={styles.titleAccent}>been</Text>.
        </Text>
        <Text style={styles.subtitle}>
          A private map to pin every morning, trip, and tiny moment only the two of you remember.
        </Text>

        <View style={styles.ctas}>
          <TouchableOpacity
            style={styles.ctaAccent}
            activeOpacity={0.85}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.ctaAccentText}>Create a new account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctaOutline}
            activeOpacity={0.7}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.ctaOutlineText}>I already have an account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          By continuing, you agree to our{" "}
          <Text style={styles.termsLink}>Terms</Text> &{" "}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MAP_BG },
  mapArea: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: SCREEN_H * 0.58,
    backgroundColor: MAP_BG,
  },
  pin: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 4,
    shadowColor: "#2a1e14",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  pinPhoto: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pinEmoji: { fontSize: 20 },
  contentCard: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    backgroundColor: PAPER,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
    shadowColor: "#1a0e06",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 8,
  },
  brandMarkIcon: { fontSize: 24 },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: ACCENT_INK,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    fontSize: 46,
    lineHeight: 46,
    color: INK,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 16,
  },
  titleAccent: { color: ACCENT_INK },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: INK_SOFT,
    marginBottom: 28,
    maxWidth: 290,
  },
  ctas: { gap: 10, marginBottom: 20 },
  ctaAccent: {
    height: 56,
    borderRadius: 18,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaAccentText: { color: "#fff", fontSize: 15.5, fontWeight: "700" },
  ctaOutline: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(42, 30, 20, 0.22)",
  },
  ctaOutlineText: { color: INK, fontSize: 15.5, fontWeight: "600" },
  terms: {
    textAlign: "center",
    fontSize: 12,
    color: INK_FAINT,
  },
  termsLink: { fontWeight: "700", color: INK_SOFT },
});
