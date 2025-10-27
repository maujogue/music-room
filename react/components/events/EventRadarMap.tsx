import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useState, useEffect, useMemo } from "react";
import MapView, { Region } from "react-native-maps";
import ErrorScreen from "@/components/generics/screens/ErrorScreen";
import LoadingSpinner from "@/components/generics/screens/LoadingSpinner";
import { useCurrentPosition } from "@/hooks/useCurrentPosition";
import { useEventsRadar } from "@/hooks/useEventsRadar";
import { EventMarker } from "@/components/events/EventMarker";

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

  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (loading) { return (<LoadingSpinner text={'Loading position'} />);}
  if (radarLoading) { return (<LoadingSpinner text={'Loading nearby events'} />);}
  if (error) { return ( <ErrorScreen  error={error}/> );}
  if (radarError) { return ( <ErrorScreen  error={error}/> );}

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
        {events.map((item) => (
          <EventMarker
            key={item.event.id}
            item={item}
            selected={item.event.id === selectedId}
            onPress={setSelectedId}
          />
        ))}
      </MapView>
    </VStack>
  );
}