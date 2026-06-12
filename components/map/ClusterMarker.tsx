import { View, Text, StyleSheet } from "react-native";

interface Props {
  count: number;
  color?: string;
}

export function ClusterMarker({ count, color = "#e07a5f" }: Props) {
  const size = count > 99 ? 52 : count > 9 ? 46 : 40;

  return (
    <View
      style={[
        styles.outer,
        {
          width: size + 10,
          height: size + 10,
          borderRadius: (size + 10) / 2,
          borderColor: color,
          backgroundColor: `${color}22`,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        ]}
      >
        <Text style={styles.count}>{count > 99 ? "99+" : count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },
  count: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
});
