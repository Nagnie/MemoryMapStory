import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MoodTag } from "@/store/memories";
import { useTheme } from "@/hooks/useTheme";

const MOODS: { tag: MoodTag; emoji: string; label: string }[] = [
  { tag: "happy", emoji: "😊", label: "Happy" },
  { tag: "nostalgic", emoji: "🥺", label: "Nostalgic" },
  { tag: "excited", emoji: "🤩", label: "Excited" },
  { tag: "peaceful", emoji: "😌", label: "Peaceful" },
  { tag: "sad", emoji: "😢", label: "Sad" },
];

interface Props {
  selected: MoodTag | null;
  onSelect: (tag: MoodTag | null) => void;
}

export function MoodTagPicker({ selected, onSelect }: Props) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      {MOODS.map(({ tag, emoji, label }) => {
        const active = selected === tag;
        return (
          <TouchableOpacity
            key={tag}
            style={[
              styles.chip,
              {
                backgroundColor: active ? `${t.primary}22` : t.surface,
                borderColor: active ? t.primary : t.border,
              },
            ]}
            onPress={() => onSelect(active ? null : tag)}
            activeOpacity={0.75}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.label, { color: active ? t.primary : t.textMuted }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  emoji: { fontSize: 16 },
  label: { fontSize: 12.5, fontWeight: "600" },
});
