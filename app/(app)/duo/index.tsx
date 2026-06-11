import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { useDuoMapStore, DuoMap, DuoMember } from "@/store/duoMap";
import { PartnerStatus } from "@/components/duo/PartnerStatus";
import { useTheme } from "@/hooks/useTheme";

export default function DuoIndexScreen() {
  const t = useTheme();
  const { user } = useAuthStore();
  const { duoMap, members, isLoading, partnerOnline, setDuoMap, setMembers, setLoading } =
    useDuoMapStore();

  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);

  const partner = members.find((m) => m.user_id !== user?.id);
  const isActive = members.length >= 2;

  const fetchDuoMap = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from("duo_map_members")
      .select("duo_map_id, duo_maps(id, invite_code, created_at)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data?.duo_maps) {
      const dm = (Array.isArray(data.duo_maps) ? data.duo_maps[0] : data.duo_maps) as DuoMap;
      setDuoMap(dm);

      const [membersRes, profilesRes] = await Promise.all([
        supabase
          .from("duo_map_members")
          .select("id, duo_map_id, user_id, joined_at")
          .eq("duo_map_id", data.duo_map_id),
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", data.duo_map_id),
      ]);

      // Fetch profile for each member
      const rawMembers = membersRes.data ?? [];
      const memberIds = rawMembers.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", memberIds);

      const enriched: DuoMember[] = rawMembers.map((m) => ({
        ...m,
        profile: profiles?.find((p) => p.id === m.user_id) ?? null,
      }));
      setMembers(enriched);
    } else {
      setDuoMap(null);
      setMembers([]);
    }

    setLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchDuoMap();
    }, [fetchDuoMap])
  );

  async function handleCreate() {
    if (!user) return;
    setIsCreating(true);
    const { data, error } = await supabase.rpc("create_duo_map");

    if (error || data?.error) {
      const msg = data?.error === "already_in_duo_map"
        ? "You're already in a duo map."
        : "Failed to create duo map. Try again.";
      Alert.alert("Error", msg);
      setIsCreating(false);
      return;
    }

    setDuoMap({ id: data.id, invite_code: data.invite_code, created_at: new Date().toISOString() });
    setMembers([{ id: "", duo_map_id: data.id, user_id: user.id, joined_at: new Date().toISOString() }]);
    setIsCreating(false);
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      Alert.alert("Invalid code", "Please enter a 6-character invite code.");
      return;
    }

    setIsJoining(true);
    const { data, error } = await supabase.rpc("join_duo_map", { p_invite_code: code });

    if (error || data?.error) {
      const messages: Record<string, string> = {
        invalid_code: "That code doesn't exist.",
        map_full: "This duo map is already full.",
        already_in_duo_map: "You're already in a duo map.",
      };
      Alert.alert("Error", messages[data?.error] ?? "Failed to join. Try again.");
      setIsJoining(false);
      return;
    }

    setJoinCode("");
    setShowJoinInput(false);
    await fetchDuoMap();
    setIsJoining(false);
  }

  async function handleShare() {
    if (!duoMap) return;
    try {
      await Share.share({
        message: `Join my Duo Map on MemoryMapStory! Code: ${duoMap.invite_code}`,
      });
    } catch {}
  }

  function handleOpenMap() {
    if (!duoMap) return;
    router.push(`/(app)/duo/${duoMap.id}`);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: t.text }]}>Duo Map</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          Share memories in real-time with someone special
        </Text>

        {!duoMap && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: t.primary }]}
              onPress={handleCreate}
              disabled={isCreating}
              activeOpacity={0.85}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.primaryBtnText}>Create New Duo Map</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={[styles.divider, { backgroundColor: t.border }]} />
              <Text style={[styles.orText, { color: t.textFaint }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: t.border }]} />
            </View>

            {!showJoinInput ? (
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: t.border }]}
                onPress={() => setShowJoinInput(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="key-outline" size={18} color={t.primary} />
                <Text style={[styles.secondaryBtnText, { color: t.primary }]}>
                  Join with Invite Code
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.joinRow}>
                <TextInput
                  style={[
                    styles.codeInput,
                    { backgroundColor: t.surface, borderColor: t.border, color: t.text },
                  ]}
                  value={joinCode}
                  onChangeText={(v) => setJoinCode(v.toUpperCase())}
                  placeholder="ABCD12"
                  placeholderTextColor={t.textFaint}
                  maxLength={6}
                  autoCapitalize="characters"
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.joinBtn, { backgroundColor: t.primary }]}
                  onPress={handleJoin}
                  disabled={isJoining}
                  activeOpacity={0.85}
                >
                  {isJoining ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.joinBtnText}>Join</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {duoMap && !isActive && (
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={styles.waitingIcon}>
              <Ionicons name="hourglass-outline" size={32} color={t.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: t.text }]}>Waiting for your partner...</Text>
            <Text style={[styles.cardSub, { color: t.textMuted }]}>
              Share this code so they can join
            </Text>

            <View style={[styles.codeBadge, { backgroundColor: t.primaryLight }]}>
              {duoMap.invite_code.split("").map((char, i) => (
                <Text key={i} style={[styles.codeChar, { color: t.primary }]}>
                  {char}
                </Text>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: t.primary }]}
              onPress={handleShare}
              activeOpacity={0.85}
            >
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Share Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {duoMap && isActive && (
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={[styles.partnerAvatar, { backgroundColor: t.primaryLight }]}>
              <Ionicons name="person" size={28} color={t.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: t.text }]}>
              {partner?.profile?.full_name ?? "Your Partner"}
            </Text>
            <PartnerStatus
              online={partnerOnline}
              name={null}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: t.primary, marginTop: 20 }]}
              onPress={handleOpenMap}
              activeOpacity={0.85}
            >
              <Ionicons name="map" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Open Duo Map</Text>
            </TouchableOpacity>

            <View style={[styles.dividerFull, { backgroundColor: t.border }]} />
            <Text style={[styles.inviteLabel, { color: t.textFaint }]}>
              Your invite code: {duoMap.invite_code}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
  },
  section: { gap: 16 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerFull: {
    height: 1,
    marginVertical: 16,
  },
  orText: {
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  joinRow: {
    flexDirection: "row",
    gap: 10,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 6,
    textAlign: "center",
  },
  joinBtn: {
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
  },
  joinBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  waitingIcon: {
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  cardSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  codeBadge: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  codeChar: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 2,
  },
  partnerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  inviteLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
