import type { Memory } from "@/store/memories";

export interface ClusterPoint {
  id: string;
  items: Memory[];
  latitude: number;
  longitude: number;
  count: number;
  isCluster: boolean;
}

// Group memories into spatial clusters based on current zoom (latitudeDelta)
export function clusterMemories(
  memories: Memory[],
  latDelta: number
): ClusterPoint[] {
  // Zoomed in enough — show individual pins
  if (latDelta < 0.015 || memories.length === 0) {
    return memories.map((m) => ({
      id: m.id,
      items: [m],
      latitude: m.latitude,
      longitude: m.longitude,
      count: 1,
      isCluster: false,
    }));
  }

  const radius = latDelta * 0.12;
  const assigned = new Set<string>();
  const clusters: ClusterPoint[] = [];

  for (const memory of memories) {
    if (assigned.has(memory.id)) continue;

    const nearby = memories.filter(
      (m) =>
        !assigned.has(m.id) &&
        Math.abs(m.latitude - memory.latitude) < radius &&
        Math.abs(m.longitude - memory.longitude) < radius
    );

    nearby.forEach((m) => assigned.add(m.id));

    const lat = nearby.reduce((s, m) => s + m.latitude, 0) / nearby.length;
    const lng = nearby.reduce((s, m) => s + m.longitude, 0) / nearby.length;

    clusters.push({
      id: nearby.length === 1 ? nearby[0].id : `cluster_${memory.id}_${nearby.length}`,
      items: nearby,
      latitude: lat,
      longitude: lng,
      count: nearby.length,
      isCluster: nearby.length > 1,
    });
  }

  return clusters;
}

// Compute bounding region that fits all memories with padding
export function getBoundingRegion(memories: Memory[]) {
  if (!memories.length) return null;

  const lats = memories.map((m) => m.latitude);
  const lngs = memories.map((m) => m.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pad = 0.008;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat + pad * 2, 0.012),
    longitudeDelta: Math.max(maxLng - minLng + pad * 2, 0.012),
  };
}
