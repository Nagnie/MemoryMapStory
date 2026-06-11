import { useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MapWrapper } from "@/components/map/MapWrapper";
import { MemoryPin } from "@/components/map/MemoryPin";
import { useLocation } from "@/hooks/useLocation";
import { useMemories } from "@/hooks/useMemories";
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
  const { memories } = useMemories();

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

  function handleAddMemory() {
    Alert.alert("Phase 2 coming soon!", "Memory creation will be available next.");
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
          {memories.map((memory) => (
            <Marker
              key={memory.id}
              coordinate={{ latitude: memory.latitude, longitude: memory.longitude }}
              tracksViewChanges={false}
            >
              <MemoryPin imageUrl={memory.image_url} />
            </Marker>
          ))}
        </MapView>

        {/* Top controls */}
        <SafeAreaView style={styles.topControls} edges={["top"]}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: t.surface }]}
            onPress={handleLocateMe}
          >
            <Ionicons name="locate" size={20} color={t.primary} />
          </TouchableOpacity>
        </SafeAreaView>

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: t.primary }]}
          onPress={handleAddMemory}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
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
});
