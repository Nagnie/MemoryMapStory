import { useRef, useState, useMemo, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import MapView, { Marker, Region, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MapWrapper } from "@/components/map/MapWrapper";
import { MapLoadingOverlay } from "@/components/map/MapLoadingOverlay";
import { MemoryPin } from "@/components/map/MemoryPin";
import { StackedMemoryPin } from "@/components/map/StackedMemoryPin";
import { StackSheet } from "@/components/map/StackSheet";
import { ClusterMarker } from "@/components/map/ClusterMarker";
import { OfflineBadge } from "@/components/memory/OfflineBadge";
import { useLocation } from "@/hooks/useLocation";
import { useMemories } from "@/hooks/useMemories";
import type { Memory } from "@/store/memories";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { clusterMemories, getBoundingRegion } from "@/lib/cluster";
import { mapStyle } from "@/lib/mapStyle";
import { useTheme } from "@/hooks/useTheme";

const HO_CHI_MINH = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const t = useTheme();
  const mapRef = useRef<MapView>(null);
  const { location, permissionGranted } = useLocation();
  const { memories, isLoading } = useMemories();
  const { pendingCount, isSyncing } = useOfflineSync();

  const [latDelta, setLatDelta] = useState(0.05);
  const [stackMemories, setStackMemories] = useState<Memory[] | null>(null);
  const regionRef = useRef<Region>(HO_CHI_MINH);
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabAnim = useRef<Animated.CompositeAnimation | null>(null);

  // Pulse FAB when map is loaded and idle
  useEffect(() => {
    if (isLoading) return;
    fabAnim.current = Animated.loop(
      Animated.sequence([
        Animated.timing(fabScale, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    fabAnim.current.start();
    return () => {
      fabAnim.current?.stop();
      fabScale.setValue(1);
    };
  }, [isLoading]);

  function stopPulse() {
    fabAnim.current?.stop();
    Animated.timing(fabScale, { toValue: 1, duration: 120, useNativeDriver: true }).start();
  }

  const clusters = useMemo(
    () => clusterMemories(memories, latDelta),
    [memories, latDelta]
  );

  function handleLocateMe() {
    if (!location) return;
    const next = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    };
    // Đồng bộ ngay để nút zoom tính từ vị trí mới, không nhảy về region cũ
    regionRef.current = next;
    setLatDelta(next.latitudeDelta);
    mapRef.current?.animateToRegion(next, 500);
  }

  function handleRegionChange(region: Region) {
    regionRef.current = region;
    setLatDelta(region.latitudeDelta);
  }

  // factor < 1 → zoom in (vùng nhìn nhỏ lại), factor > 1 → zoom out
  function handleZoom(factor: number) {
    const region = regionRef.current;
    const latitudeDelta = Math.min(
      Math.max(region.latitudeDelta * factor, 0.002),
      120
    );
    const longitudeDelta = Math.min(
      Math.max(region.longitudeDelta * factor, 0.002),
      120
    );
    const next = {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta,
      longitudeDelta,
    };
    regionRef.current = next;
    mapRef.current?.animateToRegion(next, 250);
  }

  function handleClusterPress(latitudes: number[], longitudes: number[]) {
    const region = getBoundingRegion(
      latitudes.map((lat, i) => ({ latitude: lat, longitude: longitudes[i] } as any))
    );
    if (region) {
      mapRef.current?.animateToRegion(region, 400);
    }
  }

  function handleAddMemory() {
    stopPulse();
    router.push("/(app)/memory/create");
  }

  return (
    <MapWrapper permissionGranted={permissionGranted}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          customMapStyle={mapStyle}
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
          onRegionChangeComplete={handleRegionChange}
        >
          {clusters.map((cluster) => {
            if (cluster.isCluster) {
              return (
                <Marker
                  key={cluster.id}
                  coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
                  anchor={{ x: 0.5, y: 1 }}
                  tracksViewChanges={false}
                  onPress={() =>
                    handleClusterPress(
                      cluster.items.map((m) => m.latitude),
                      cluster.items.map((m) => m.longitude)
                    )
                  }
                >
                  <ClusterMarker count={cluster.count} color={t.primary} />
                </Marker>
              );
            }

            // Nhiều memory trùng vị trí → chồng thẻ lệch nhau
            if (cluster.items.length > 1) {
              return (
                <Marker
                  key={cluster.id}
                  coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
                  anchor={{ x: 0.5, y: 1 }}
                  tracksViewChanges={false}
                  onPress={() => setStackMemories(cluster.items)}
                >
                  <StackedMemoryPin imageUrls={cluster.items.map((m) => m.image_url)} />
                </Marker>
              );
            }

            return (
              <Marker
                key={cluster.id}
                coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
                anchor={{ x: 0.5, y: 1 }}
                tracksViewChanges={false}
                onPress={() => router.push(`/(app)/memory/${cluster.items[0].id}`)}
              >
                <MemoryPin imageUrl={cluster.items[0].image_url} />
              </Marker>
            );
          })}
        </MapView>

        {/* Bảng chọn khi bấm vào chồng ảnh cùng vị trí */}
        <StackSheet
          memories={stackMemories}
          onClose={() => setStackMemories(null)}
          onSelect={(id) => {
            setStackMemories(null);
            router.push(`/(app)/memory/${id}`);
          }}
        />

        {/* Loading overlay — ghost pins while fetching */}
        <MapLoadingOverlay visible={isLoading} />

        {/* Top controls */}
        <SafeAreaView style={styles.topControls} edges={["top"]}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: t.surface }]}
            onPress={handleLocateMe}
          >
            <Ionicons name="locate" size={20} color={t.primary} />
          </TouchableOpacity>

          {/* Zoom controls — bấm để phóng to/thu nhỏ (cho laptop không pinch được) */}
          <View style={styles.zoomGroup}>
            <TouchableOpacity
              style={[styles.iconBtn, styles.zoomTop, { backgroundColor: t.surface }]}
              onPress={() => handleZoom(0.5)}
            >
              <Ionicons name="add" size={22} color={t.primary} />
            </TouchableOpacity>
            <View style={[styles.zoomDivider, { backgroundColor: t.border }]} />
            <TouchableOpacity
              style={[styles.iconBtn, styles.zoomBottom, { backgroundColor: t.surface }]}
              onPress={() => handleZoom(2)}
            >
              <Ionicons name="remove" size={22} color={t.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Offline badge */}
        {(pendingCount > 0 || isSyncing) && (
          <View style={styles.offlineBadge}>
            <OfflineBadge count={pendingCount} syncing={isSyncing} />
          </View>
        )}

        {/* Animated FAB */}
        <Animated.View
          style={[
            styles.fab,
            { backgroundColor: t.primary, transform: [{ scale: fabScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.fabInner}
            onPress={handleAddMemory}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </MapWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topControls: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingRight: 16,
    paddingTop: 8,
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
  zoomGroup: {
    marginTop: 12,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
  },
  zoomTop: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  zoomBottom: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  zoomDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 8,
  },
  offlineBadge: {
    position: "absolute",
    top: 210,
    right: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  fabInner: {
    flex: 1,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
});
