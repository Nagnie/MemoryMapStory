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
