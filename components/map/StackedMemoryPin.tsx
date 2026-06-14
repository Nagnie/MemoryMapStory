import { View, Image, Text, StyleSheet } from "react-native";

interface Props {
  /** Ảnh các memory cùng vị trí — phần tử đầu là ảnh nằm trên cùng */
  imageUrls: string[];
  size?: number;
  borderColor?: string;
}

// Khi nhiều memory ở gần như trùng toạ độ, xếp chúng thành "chồng thẻ":
// các ảnh phía sau lệch + xoay nhẹ để thấy rõ là có nhiều, không bị che thành 1.
export function StackedMemoryPin({
  imageUrls,
  size = 54,
  borderColor = "#fff",
}: Props) {
  const count = imageUrls.length;
  // tối đa 2 thẻ ló ra phía sau cho gọn
  const behind = imageUrls.slice(1, 3);
  const areaW = size + 22;
  const areaH = size + 16;

  return (
    <View style={styles.wrapper}>
      <View style={{ width: areaW, height: areaH }}>
        {behind.map((url, i) => {
          const depth = i + 1; // 1, 2
          const rot = depth === 1 ? 9 : -9;
          return (
            <View
              key={`${url}-${i}`}
              style={[
                styles.card,
                {
                  width: size,
                  height: size,
                  borderRadius: size * 0.28,
                  borderColor,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  transform: [{ rotate: `${rot}deg` }, { translateY: -depth * 3 }],
                  zIndex: -depth,
                },
              ]}
            >
              <Image
                source={{ uri: url }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            </View>
          );
        })}

        {/* Thẻ trên cùng */}
        <View
          style={[
            styles.card,
            styles.front,
            {
              width: size,
              height: size,
              borderRadius: size * 0.28,
              borderColor,
              marginLeft: -size / 2,
              marginTop: -size / 2,
            },
          ]}
        >
          <View style={[styles.placeholder, { borderRadius: size * 0.22 }]} />
          <Image
            source={{ uri: imageUrls[0] }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={[styles.tail, { borderTopColor: borderColor }]} />
      {/* đệm để nâng pin cao hơn chấm vị trí, tránh bị che */}
      <View style={styles.lift} />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  card: {
    position: "absolute",
    top: "50%",
    left: "50%",
    overflow: "hidden",
    borderWidth: 3,
    backgroundColor: "#d1d5db",
  },
  front: {
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 6,
  },
  placeholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  lift: {
    height: 16,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: 4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#e07a5f",
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
});
