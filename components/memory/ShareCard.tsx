import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MOOD_EMOJI, type Memory } from "@/store/memories";

interface Props {
  memory: Memory;
}

export const SHARE_CARD_WIDTH = 360;
export const SHARE_CARD_HEIGHT = 480;

/**
 * Card render off-screen để capture bằng react-native-view-shot → share image.
 * Kích thước cố định — capture scale lên 3x cho ảnh nét.
 */
export function ShareCard({ memory }: Props) {
  const place =
    memory.place_name ??
    `${memory.latitude.toFixed(5)}, ${memory.longitude.toFixed(5)}`;
  const date = new Date(memory.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: memory.image_url }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Watermark/branding */}
      <View style={styles.brand}>
        <Ionicons name="location" size={12} color="#fff" />
        <Text style={styles.brandText}>MemoryMapStory</Text>
      </View>

      {/* Info panel */}
      <View style={styles.panel}>
        {memory.mood_tag && (
          <View style={styles.moodBadge}>
            <Text style={styles.moodEmoji}>{MOOD_EMOJI[memory.mood_tag]}</Text>
            <Text style={styles.moodLabel}>{memory.mood_tag}</Text>
          </View>
        )}
        {memory.caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {memory.caption}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.75)" />
          <Text style={styles.metaText} numberOfLines={1}>
            {place}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.75)" />
          <Text style={styles.metaText}>{date}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  brand: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  brandText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  panel: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 18,
    padding: 14,
    gap: 7,
  },
  moodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  moodEmoji: { fontSize: 14 },
  moodLabel: {
    color: "#fff",
    fontSize: 11.5,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  caption: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    flexShrink: 1,
  },
});
