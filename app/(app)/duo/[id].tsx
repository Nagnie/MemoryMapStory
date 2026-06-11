import { useRef, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MapWrapper } from "@/components/map/MapWrapper";
import { MemoryPin } from "@/components/map/MemoryPin";
import { PartnerStatus } from "@/components/duo/PartnerStatus";
import { useLocation } from "@/hooks/useLocation";
import { useDuoMapRealtime } from "@/hooks/useDuoMap";
import { useDuoMapStore } from "@/store/duoMap";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/hooks/useTheme";

const PARTNER_COLOR = "#60a5fa";

type Filter = "all" | "mine" | "partner";

const HO_CHI_MINH = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function DuoMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const mapRef = useRef<MapView>(null);
  const { user } = useAuthStore();
  const { location, permissionGranted } = useLocation();
  const { memories, members, partnerOnline } = useDuoMapStore();
  const [filter, setFilter] = useState<Filter>("all");

  useDuoMapRealtime(id);

  const partner = members.find((m) => m.user_id !== user?.id);

  const filteredMemories = useMemo(() => {
    if (filter === "mine") return memories.filter((m) => m.user_id === user?.id);
    if (filter === "partner") return memories.filter((m) => m.user_id !== user?.id);
    return memories;
  }, [memories, filter, user?.id]);

  function handleLocateMe() {
    if (!location) return;
    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      500
    );
  }

  return (
    <MapWrapper permissionGranted={permissionGranted}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          initialRegion={
            location
              ? {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }
              : HO_CHI_MINH
          }
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {filteredMemories.map((memory) => {
            const isMe = memory.user_id === user?.id;
            return (
              <Marker
                key={memory.id}
                coordinate={{ latitude: memory.latitude, longitude: memory.longitude }}
                tracksViewChanges={false}
                onPress={() => router.push(`/(app)/memory/${memory.id}`)}
              >
                <MemoryPin
                  imageUrl={memory.image_url}
                  borderColor={isMe ? t.primary : PARTNER_COLOR}
                />
              </Marker>
            );
          })}
        </MapView>

        {/* Top bar */}
        <SafeAreaView style={styles.topBar} edges={["top"]}>
          <View style={styles.topLeft}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: t.surface }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color={t.text} />
            </TouchableOpacity>
          </View>

          {/* Filter chips */}
          <View style={[styles.filterRow, { backgroundColor: t.surface }]}>
            {(["all", "mine", "partner"] as Filter[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  filter === f && { backgroundColor: t.primary },
                ]}
                onPress={() => setFilter(f)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: filter === f ? "#fff" : t.textMuted },
                  ]}
                >
                  {f === "all" ? "All" : f === "mine" ? "Mine" : "Partner"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.topRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: t.surface }]}
              onPress={handleLocateMe}
            >
              <Ionicons name="locate" size={20} color={t.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Partner status badge */}
        <View
          style={[
            styles.partnerBadge,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
        >
          <PartnerStatus
            online={partnerOnline}
            name={partner?.profile?.full_name ?? "Partner"}
          />
        </View>

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: t.primary }]}
          onPress={() => router.push("/(app)/memory/create")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>

        {/* Legend */}
        <View
          style={[
            styles.legend,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
        >
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: t.primary }]} />
            <Text style={[styles.legendText, { color: t.textSecondary }]}>Me</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PARTNER_COLOR }]} />
            <Text style={[styles.legendText, { color: t.textSecondary }]}>
              {partner?.profile?.full_name?.split(" ")[0] ?? "Partner"}
            </Text>
          </View>
        </View>
      </View>
    </MapWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  topLeft: {},
  topRight: {},
  filterRow: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 20,
    padding: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
  },
  partnerBadge: {
    position: "absolute",
    bottom: 96,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  legend: {
    position: "absolute",
    bottom: 96,
    right: 20,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
