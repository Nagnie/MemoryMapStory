import * as Location from "expo-location";

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  const granted = await requestLocationPermission();
  if (!granted) return null;
  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
}

/**
 * Tọa độ → "{street}, {district}, {city}". Bỏ qua field nào thiếu,
 * trả null nếu không resolve được (offline, lỗi service…) — caller fallback về tọa độ.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!address) return null;

    const street = address.street
      ? [address.streetNumber, address.street].filter(Boolean).join(" ")
      : null;
    const district = address.district ?? address.subregion;
    const city = address.city ?? address.region;

    const parts: string[] = [];
    for (const part of [street, district, city]) {
      if (part && !parts.includes(part)) parts.push(part);
    }
    if (!parts.length) return address.name ?? null;
    return parts.join(", ");
  } catch {
    return null;
  }
}
