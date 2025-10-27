import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useState, useEffect, useMemo } from "react";
import MapView, { Region } from "react-native-maps";
import ErrorScreen from "@/components/generics/screens/ErrorScreen";
import LoadingSpinner from "@/components/generics/screens/LoadingSpinner";
import { useCurrentPosition } from "@/hooks/useCurrentPosition";

type RadarProps = {
  radiusKm?: number;
  events?: MusicEventFetchResult[];
};


export default function EventRadarmap({ radiusKm = 50 }: RadarProps) {

  const {
    coords,
    loading,
    error,
    region,
  } = useCurrentPosition({radiusKm})

  const { events, launchRadar, loading: radarLoading, error: radarError } = useEventsRadar(coords)
  

  if (loading) {
    return (
      <LoadingSpinner text={'Loading position'} />
    );
  }

  if (error) {
    return (
      <ErrorScreen  error={error}/>
    );
  }

  return (
    <VStack className="h-full w-full">
      <MapView
        style={{ flex: 1 }}
        initialRegion={
          region ?? {
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 1.8,
            longitudeDelta: 2.7,
          }
        }
        showsUserLocation
        showsMyLocationButton
      >
      </MapView>
    </VStack>
  );
}