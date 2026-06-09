import { View, Text, TouchableOpacity, Image, Alert, ScrollView, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/hooks/useTheme";

const SCENE_COLORS = ["#d4a574", "#7ab8c4", "#c4a87a", "#94b494"];

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const t = useTheme();
  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name ?? "No name";
  const email = user?.email ?? "";
  const handle = email.split("@")[0];
  const initial = fullName[0]?.toUpperCase() ?? "?";

  async function handleLogout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  const s = createStyles(t);

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.background }]} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Nav */}
        <View style={s.nav}>
          <Text style={[s.navTitle, { color: t.text }]}>Profile</Text>
          <TouchableOpacity style={s.navBtn}>
            <Ionicons name="notifications-outline" size={22} color={t.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Cover film strip */}
        <View style={s.cover}>
          {SCENE_COLORS.map((c, i) => (
            <View key={i} style={[s.coverSlice, { backgroundColor: c }]} />
          ))}
          <View style={[s.coverFade, { backgroundColor: t.background }]} />
        </View>

        {/* Avatar + info */}
        <View style={s.heroSection}>
          <View style={[s.avRing, { backgroundColor: "#fff" }]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={s.avImage} />
            ) : (
              <View style={[s.avCircle, { backgroundColor: t.primary }]}>
                <Text style={s.avInitial}>{initial}</Text>
              </View>
            )}
          </View>
          <Text style={[s.name, { color: t.text }]}>{fullName}</Text>
          <Text style={[s.handle, { color: t.textMuted }]}>@{handle}</Text>
          <Text style={[s.bio, { color: t.textMuted }]}>
            "Everywhere is home, as long as you're there and the coffee is good."
          </Text>
        </View>

        {/* Stats */}
        <View style={[s.stats, { backgroundColor: t.surface, borderColor: t.border }]}>
          <StatCell num="42" label="Memories" t={t} />
          <View style={[s.statDivider, { backgroundColor: t.border }]} />
          <StatCell num="8" label="Places" t={t} />
          <View style={[s.statDivider, { backgroundColor: t.border }]} />
          <StatCell num="147" label="Days together" t={t} />
        </View>

        {/* Partner card */}
        <View style={[s.duoCard, { borderColor: `${t.primary}20` }]}>
          <View style={s.duoPair}>
            <View style={[s.duoAv, { backgroundColor: t.primary }]}>
              <Text style={s.duoAvText}>{initial}</Text>
            </View>
            <View style={[s.duoAv, s.duoAvSecond, { backgroundColor: "#7ab8c4" }]}>
              <Text style={s.duoAvText}>M</Text>
            </View>
          </View>
          <View style={s.duoText}>
            <Text style={[s.duoName, { color: t.text }]}>Paired with Minh Anh</Text>
            <Text style={[s.duoSince, { color: t.textMuted }]}>Since Sep 14, 2025 · 3 trips together</Text>
          </View>
          <View style={[s.duoChev, { backgroundColor: "rgba(255,255,255,0.7)" }]}>
            <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
          </View>
        </View>

        {/* Settings list */}
        <View style={[s.setList, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Link href="/(app)/profile/edit" asChild>
            <TouchableOpacity style={s.setRow} activeOpacity={0.7}>
              <View style={[s.setIcon, { backgroundColor: `${t.primary}20` }]}>
                <Ionicons name="person-outline" size={17} color={t.primaryDark} />
              </View>
              <View style={s.setText}>
                <Text style={[s.setLabel, { color: t.text }]}>Edit profile</Text>
                <Text style={[s.setSub, { color: t.textFaint }]}>Name, photo, bio</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={t.textFaint} />
            </TouchableOpacity>
          </Link>
          <View style={[s.setDivider, { backgroundColor: t.border }]} />
          <TouchableOpacity style={s.setRow} activeOpacity={0.7}>
            <View style={[s.setIcon, { backgroundColor: "rgba(122, 184, 196, 0.2)" }]}>
              <Ionicons name="link-outline" size={17} color="#4a8fa0" />
            </View>
            <View style={s.setText}>
              <Text style={[s.setLabel, { color: t.text }]}>Manage partner</Text>
              <Text style={[s.setSub, { color: t.textFaint }]}>Invite, change permissions, disconnect</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={t.textFaint} />
          </TouchableOpacity>
          <View style={[s.setDivider, { backgroundColor: t.border }]} />
          <TouchableOpacity style={s.setRow} activeOpacity={0.7}>
            <View style={[s.setIcon, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}>
              <Ionicons name="shield-checkmark-outline" size={17} color="#198a47" />
            </View>
            <View style={s.setText}>
              <Text style={[s.setLabel, { color: t.text }]}>Privacy & data</Text>
              <Text style={[s.setSub, { color: t.textFaint }]}>Who can see your pins</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={t.textFaint} />
          </TouchableOpacity>
          <View style={[s.setDivider, { backgroundColor: t.border }]} />
          <TouchableOpacity style={s.setRow} activeOpacity={0.7}>
            <View style={[s.setIcon, { backgroundColor: "rgba(234, 179, 8, 0.15)" }]}>
              <Ionicons name="notifications-outline" size={17} color="#9a7200" />
            </View>
            <View style={s.setText}>
              <Text style={[s.setLabel, { color: t.text }]}>Notifications</Text>
              <Text style={[s.setSub, { color: t.textFaint }]}>When your partner drops a new pin</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={t.textFaint} />
          </TouchableOpacity>
          <View style={[s.setDivider, { backgroundColor: t.border }]} />
          <TouchableOpacity style={s.setRow} activeOpacity={0.7} onPress={handleLogout}>
            <View style={[s.setIcon, { backgroundColor: `${t.primary}18` }]}>
              <Ionicons name="log-out-outline" size={17} color={t.primaryDark} />
            </View>
            <View style={s.setText}>
              <Text style={[s.setLabel, { color: t.primaryDark }]}>Sign out</Text>
              <Text style={[s.setSub, { color: t.textFaint }]}>This session will end on device</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={t.textFaint} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCell({ num, label, t }: { num: string; label: string; t: ReturnType<typeof useTheme> }) {
  const s = StyleSheet.create({
    cell: { flex: 1, alignItems: "center", paddingVertical: 4, paddingHorizontal: 6 },
    num: { fontSize: 28, fontWeight: "800", color: t.text, lineHeight: 30 },
    lbl: { fontSize: 10.5, color: t.textFaint, marginTop: 5, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "600" },
  });
  return (
    <View style={s.cell}>
      <Text style={s.num}>{num}</Text>
      <Text style={s.lbl}>{label}</Text>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    flex: { flex: 1 },
    nav: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 22, paddingTop: 8, paddingBottom: 0,
      height: 52,
    },
    navTitle: { fontSize: 15, fontWeight: "700" },
    navBtn: {
      marginLeft: "auto", width: 36, height: 36,
      alignItems: "center", justifyContent: "center",
    },
    cover: {
      height: 120,
      flexDirection: "row",
      overflow: "hidden",
    },
    coverSlice: { flex: 1 },
    coverFade: {
      position: "absolute", left: 0, right: 0, bottom: 0, height: 60,
      opacity: 0.9,
    },
    heroSection: {
      alignItems: "center",
      paddingHorizontal: 22,
      paddingBottom: 8,
      marginTop: -50,
    },
    avRing: {
      width: 110, height: 110, borderRadius: 55,
      padding: 5, marginBottom: 14,
      shadowColor: "#2a1e14",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18, shadowRadius: 20, elevation: 10,
    },
    avImage: { width: "100%", height: "100%", borderRadius: 50 },
    avCircle: {
      width: "100%", height: "100%", borderRadius: 50,
      alignItems: "center", justifyContent: "center",
    },
    avInitial: { fontSize: 44, fontWeight: "800", color: "#fff" },
    name: { fontSize: 32, fontWeight: "800", letterSpacing: -0.3, lineHeight: 34 },
    handle: { fontSize: 13, marginTop: 4 },
    bio: { fontSize: 14, lineHeight: 22, marginTop: 12, textAlign: "center", maxWidth: 280 },
    stats: {
      flexDirection: "row", marginHorizontal: 22, marginTop: 20,
      borderRadius: 22, paddingVertical: 16, paddingHorizontal: 8,
      borderWidth: 0.5,
    },
    statDivider: { width: 0.5, marginVertical: 4 },
    duoCard: {
      marginHorizontal: 22, marginTop: 16,
      borderRadius: 22, padding: 16,
      flexDirection: "row", alignItems: "center", gap: 14,
      backgroundColor: `#e07a5f14`,
      borderWidth: 0.5,
    },
    duoPair: { flexDirection: "row", alignItems: "center" },
    duoAv: {
      width: 42, height: 42, borderRadius: 21,
      alignItems: "center", justifyContent: "center",
      borderWidth: 3, borderColor: "#fff",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    duoAvSecond: { marginLeft: -14 },
    duoAvText: { color: "#fff", fontWeight: "800", fontSize: 16 },
    duoText: { flex: 1 },
    duoName: { fontSize: 13.5, fontWeight: "600" },
    duoSince: { fontSize: 11.5, marginTop: 2 },
    duoChev: {
      width: 30, height: 30, borderRadius: 15,
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    },
    setList: {
      marginHorizontal: 22, marginTop: 16,
      borderRadius: 22, overflow: "hidden", borderWidth: 0.5,
    },
    setRow: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 18, paddingVertical: 14, gap: 14,
    },
    setDivider: { height: 0.5, marginHorizontal: 18 },
    setIcon: {
      width: 34, height: 34, borderRadius: 10,
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    setText: { flex: 1 },
    setLabel: { fontSize: 14.5, fontWeight: "600" },
    setSub: { fontSize: 11.5, marginTop: 1 },
  });
}
