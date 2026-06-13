import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MOOD_EMOJI, type Memory } from "@/store/memories";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  memory: Memory;
  onPress: () => void;
}

export function MemoryCard({ memory, onPress }: Props) {
  const t = useTheme();

  const time = new Date(memory.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const place =
    memory.place_name ??
    `${memory.latitude.toFixed(4)}, ${memory.longitude.toFixed(4)}`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Image source={{ uri: memory.image_url }} style={styles.thumb} />

      <View style={styles.body}>
        {memory.caption ? (
          <Text style={[styles.caption, { color: t.text }]} numberOfLines={1}>
            {memory.caption}
          </Text>
        ) : (
          <Text style={[styles.caption, { color: t.textFaint, fontStyle: "italic" }]}>
            No caption
          </Text>
        )}
        <View style={styles.placeRow}>
          <Ionicons name="location-outline" size={12} color={t.textMuted} />
          <Text style={[styles.place, { color: t.textMuted }]} numberOfLines={1}>
            {place}
          </Text>
        </View>
        <Text style={[styles.time, { color: t.textFaint }]}>{time}</Text>
      </View>

      {memory.mood_tag && (
        <Text style={styles.mood}>{MOOD_EMOJI[memory.mood_tag]}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#d1d5db",
  },
  body: { flex: 1, gap: 3 },
  caption: { fontSize: 14.5, fontWeight: "600" },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  place: { fontSize: 12, flex: 1 },
  time: { fontSize: 11.5 },
  mood: { fontSize: 22, marginRight: 4 },
});
