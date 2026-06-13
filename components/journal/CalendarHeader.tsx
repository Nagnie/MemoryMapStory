import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  year: number;
  month: number; // 0-based
  onPrev: () => void;
  onNext: () => void;
  /** Disable next khi đã ở tháng hiện tại */
  nextDisabled?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarHeader({ year, month, onPrev, onNext, nextDisabled }: Props) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: t.text }]}>
        {MONTH_NAMES[month]} <Text style={{ color: t.textMuted }}>{year}</Text>
      </Text>
      <View style={styles.btns}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: t.surface, borderColor: t.border }]}
          onPress={onPrev}
          hitSlop={6}
        >
          <Ionicons name="chevron-back" size={18} color={t.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: t.surface, borderColor: t.border }]}
          onPress={onNext}
          disabled={nextDisabled}
          hitSlop={6}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={nextDisabled ? t.textFaint : t.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "700" },
  btns: { flexDirection: "row", gap: 8 },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
