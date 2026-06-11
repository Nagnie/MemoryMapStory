import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { requestLocationPermission } from "@/lib/location";

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const granted = await requestLocationPermission();
      setPermissionGranted(granted);
      if (!granted) return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(current);

      subscriptionRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 20 },
        setLocation
      );
    })();

    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  return { location, permissionGranted };
}
