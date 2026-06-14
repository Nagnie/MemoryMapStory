import { View, Text, StyleSheet } from "react-native";

interface Props {
  count: number;
  color?: string;
}

// Hình "pin giọt nước": bầu tròn chứa số + mũi nhọn chỉ xuống đúng toạ độ.
// Số nằm trong bầu (phía trên mũi) nên không bị chấm vị trí của bạn che mất.
export function ClusterMarker({ count, color = "#e07a5f" }: Props) {
  const display = count > 99 ? "99+" : String(count);
  const size = count > 99 ? 46 : 40;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.bulb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      >
        <Text style={styles.count}>{display}</Text>
      </View>
      <View style={[styles.tail, { borderTopColor: color }]} />
      {/* đệm để nâng pin cao hơn chấm vị trí, tránh bị che */}
      <View style={styles.lift} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  bulb: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 11,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
  count: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  lift: {
    height: 16,
  },
});
