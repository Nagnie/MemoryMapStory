import { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { memoriesQueryKey } from "@/hooks/useMemoriesQuery";
import { duoMapQueryKey, duoMemoriesQueryKey } from "@/hooks/useDuoMapQuery";
import { useReactionsQuery, useToggleReactionMutation } from "@/hooks/useReactionsQuery";
import { useDeleteMemoryMutation } from "@/hooks/useMemoriesQuery";
import { ReactionPicker } from "@/components/memory/ReactionPicker";
import { ShareCard } from "@/components/memory/ShareCard";
import { useTheme } from "@/hooks/useTheme";
import { MOOD_EMOJI, type Memory } from "@/store/memories";
import type { DuoMap, DuoMember } from "@/store/duoMap";

export default function MemoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: memory } = useQuery({
    queryKey: ["memory", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Memory;
    },
    enabled: !!id,
    placeholderData: () => {
      // Tìm nhanh trong cache hiện có để render ngay lập tức
      const personal = queryClient.getQueryData<Memory[]>(memoriesQueryKey(user?.id));
      const duoData = queryClient.getQueryData<{ duoMap: DuoMap | null; members: DuoMember[] }>(
        duoMapQueryKey(user?.id)
      );
      const duo = duoData?.duoMap
        ? queryClient.getQueryData<Memory[]>(duoMemoriesQueryKey(duoData.duoMap.id))
        : undefined;
      return personal?.find((m) => m.id === id) ?? duo?.find((m) => m.id === id);
    },
  });

  const { data: reactions = [] } = useReactionsQuery(id);
  const { mutate: toggleReaction } = useToggleReactionMutation(id);
  const { mutate: deleteMemory } = useDeleteMemoryMutation();

  const shareCardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const isOwner = memory?.user_id === user?.id;

  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing unavailable", "Sharing is not available on this device.");
        return;
      }
      const uri = await captureRef(shareCardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share memory",
      });
    } catch (e) {
      console.error("[share memory]", e);
      Alert.alert("Error", "Could not create the share card. Please try again.");
    } finally {
      setSharing(false);
    }
  }

  function handleDelete() {
    if (!memory) return;
    Alert.alert("Delete memory?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMemory(memory.id, { onSuccess: () => router.back() });
        },
      },
    ]);
  }

  if (!memory) {
    return (
      <View style={[styles.centered, { backgroundColor: t.background }]}>
        <Text style={{ color: t.text, marginBottom: 12 }}>Memory not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: t.primary, fontWeight: "600" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const date = new Date(memory.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = new Date(memory.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      <Image source={{ uri: memory.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <View style={styles.gradient} />

      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare} disabled={sharing}>
            {sharing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="share-outline" size={20} color="#fff" />
            )}
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
        <View style={styles.details}>
          {memory.mood_tag && (
            <View style={styles.moodBadge}>
              <Text style={styles.moodEmoji}>{MOOD_EMOJI[memory.mood_tag]}</Text>
              <Text style={styles.moodLabel}>{memory.mood_tag}</Text>
            </View>
          )}
          {memory.caption ? (
            <Text style={styles.caption}>{memory.caption}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.65)" />
            <Text style={styles.metaText}>
              {date} · {time}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.65)" />
            <Text style={styles.metaText}>
              {memory.place_name ??
                `${memory.latitude.toFixed(5)}, ${memory.longitude.toFixed(5)}`}
            </Text>
          </View>

          <View style={styles.reactionSection}>
            <ReactionPicker reactions={reactions} onReact={toggleReaction} />
          </View>
        </View>
      </SafeAreaView>

      {/* Render off-screen (không dùng opacity 0 — capture sẽ ra ảnh trống) */}
      <View ref={shareCardRef} collapsable={false} style={styles.shareCardWrap}>
        <ShareCard memory={memory} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 380,
    backgroundColor: "transparent",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  topActions: { flexDirection: "row", gap: 10 },
  shareCardWrap: {
    position: "absolute",
    top: 0,
    left: -9999,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  details: { gap: 10 },
  moodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  moodEmoji: { fontSize: 16 },
  moodLabel: {
    color: "#fff",
    fontSize: 12.5,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  caption: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12.5,
  },
  reactionSection: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
});
