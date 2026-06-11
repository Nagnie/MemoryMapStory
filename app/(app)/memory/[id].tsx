import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useMemoriesStore } from "@/store/memories";
import { useTheme } from "@/hooks/useTheme";

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊",
  nostalgic: "🥺",
  excited: "🤩",
  peaceful: "😌",
  sad: "😢",
};

export default function MemoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const { memories, removeMemory } = useMemoriesStore();
  const memory = memories.find((m) => m.id === id);

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

  function handleDelete() {
    Alert.alert("Delete memory?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("memories").delete().eq("id", memory!.id);
          removeMemory(memory!.id);
          router.back();
        },
      },
    ]);
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
      {/* Full-screen image */}
      <Image source={{ uri: memory.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* Bottom gradient overlay */}
      <View style={styles.gradient} />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom details */}
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
              {memory.latitude.toFixed(5)}, {memory.longitude.toFixed(5)}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  gradient: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    height: 320,
    // simulate linear gradient: black at bottom, transparent at top
    backgroundColor: "transparent",
  },
  topBar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomBar: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  details: { gap: 8 },
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
});
