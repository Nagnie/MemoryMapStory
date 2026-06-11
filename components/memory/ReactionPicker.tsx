import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export const REACTION_EMOJIS = ["❤️", "😂", "😍", "😢", "🔥"] as const;

export interface ReactionGroup {
  emoji: string;
  count: number;
  mine: boolean;
}

interface Props {
  reactions: ReactionGroup[];
  onReact: (emoji: string) => void;
}

export function ReactionPicker({ reactions, onReact }: Props) {
  const t = useTheme();

  return (
    <View style={styles.row}>
      {REACTION_EMOJIS.map((emoji) => {
        const group = reactions.find((r) => r.emoji === emoji);
        const mine = group?.mine ?? false;
        const count = group?.count ?? 0;

        return (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.btn,
              {
                backgroundColor: mine ? t.primaryLight : "rgba(255,255,255,0.1)",
                borderColor: mine ? t.primary : "rgba(255,255,255,0.2)",
              },
            ]}
            onPress={() => onReact(emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            {count > 0 && (
              <Text
                style={[
                  styles.count,
                  { color: mine ? t.primary : "rgba(255,255,255,0.7)" },
                ]}
              >
                {count}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 18,
  },
  count: {
    fontSize: 13,
    fontWeight: "600",
  },
});
