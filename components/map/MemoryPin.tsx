import { View, Image, Text, StyleSheet } from "react-native";

interface Props {
  imageUrl: string;
  size?: number;
  borderColor?: string;
  /** Tên địa điểm hiện nhỏ phía dưới pin (Phase 5A) */
  placeName?: string | null;
}

export function MemoryPin({ imageUrl, size = 54, borderColor = "#fff", placeName }: Props) {
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.frame,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            borderColor,
          },
        ]}
      >
        <View style={[styles.placeholder, { borderRadius: size * 0.22 }]} />
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </View>
      <View style={[styles.tail, { borderTopColor: borderColor }]} />
      {placeName ? (
        <View style={styles.labelWrap}>
          <Text style={styles.label} numberOfLines={1}>
            {placeName}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  frame: {
    overflow: "hidden",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 6,
  },
  placeholder: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#d1d5db",
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1,
  },
  labelWrap: {
    marginTop: 3,
    maxWidth: 110,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  label: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
