import { useCallback, useEffect, useState } from 'react';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/ui/modal';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import LoadingSpinner from '@/components/generics/screens/LoadingSpinner';
import { VStack } from '@/components//ui/vstack';

type Coords = { latitude: number; longitude: number };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: PickedPlace) => void;
  initialCoords?: Coords;
};

async function getInitialCenter(
  initialCoords?: Coords
): Promise<Coords> {

  const googleFallback = { latitude: 37.4221, longitude: -122.0581 }
  
  if (initialCoords) return initialCoords;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return googleFallback;
  }

  try {
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout GPS')), 5000)
      ),
    ]);
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
  } catch {
    try {
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        return {
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
        };
      }
    } catch {
    }

    return googleFallback;
  }
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialCoords,
}: Props) {
  const [picked, setPicked] = useState<PickedPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!isOpen) return;

  (async () => {
    setLoading(true);
    setError(null);

    try {
      const center = await getInitialCenter(initialCoords);

      setRegion({
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });

      setPicked(null);
      setAddress(undefined);
    } catch (e: any) {
      setError(e?.message ?? 'Error initializing map.');
    } finally {
      setLoading(false);
    }
  })();
}, [isOpen, initialCoords]);

  const doReverse = useCallback(async (c: Coords) => {
    try {
      const res = await Location.reverseGeocodeAsync(c);
      const a = res?.[0];
      if (a) {
        const label = [a.name, a.street, a.postalCode, a.city, a.country]
          .filter(Boolean)
          .join(', ');
        setAddress(label);
      } else {
        setAddress(undefined);
      }
    } catch {
      setAddress(undefined);
    }
  }, []);

  const handlePress = useCallback(async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
    const r = reverse?.[0];
    const place: PickedPlace = {
      latitude,
      longitude,
      address: [r?.name, r?.street, r?.postalCode, r?.city, r?.country]
        .filter(Boolean)
        .join(', '),
      street: r?.street ?? undefined,
      postalCode: r?.postalCode ?? undefined,
      city: r?.city ?? undefined,
      region: r?.region ?? undefined,
      country: r?.country ?? undefined,
    };
    setPicked(place);
  }, []);

  const handleDragEnd = useCallback(
    async (e: any) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const c = { latitude, longitude };
      setPicked(c);
      setAddress(undefined);
      doReverse(c);
    },
    [doReverse]
  );

  const confirm = () => {
    if (picked) onConfirm(picked);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className='w-full min-h-screen-safe p-0'>
        <ModalHeader className='px-3 py-4 border-b border-neutral-200'>
          <Heading size='md'>Set event place</Heading>
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody className='p-'>
          <VStack className='w-full h-[640px] border-4 border-primary-500'>
            {loading ? (
              <LoadingSpinner text='Loading map…' />
            ) : (
              <>
                {region && (
                  <Box className='h-full w-full'>
                    <MapView
                      style={{ flex: 1 }}
                      initialRegion={region}
                      onPress={handlePress}
                      onRegionChangeComplete={setRegion}
                    >
                      {picked && (
                        <Marker
                          coordinate={picked}
                          draggable
                          onDragEnd={handleDragEnd}
                          title='Place'
                          description={address || 'Move marker if needed'}
                        />
                      )}
                    </MapView>
                  </Box>
                )}
                <Box className='p-4 gap-1'>
                  {picked ? (
                    <>
                      <Text size='sm'>Address</Text>
                      <Text numberOfLines={2}>
                        {address ?? 'Seeking address…'}
                      </Text>
                      <Text size='xs'>
                        {picked.latitude.toFixed(6)},{' '}
                        {picked.longitude.toFixed(6)}
                      </Text>
                    </>
                  ) : (
                    <Text>Tap on map</Text>
                  )}
                  {error && <Text>⚠️ {error}</Text>}
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter className='px-4 py-3 border-t border-t-neutral-200 justify-between'>
          <Button variant='outline' action='secondary' onPress={onClose}>
            <ButtonText>Cancel</ButtonText>
          </Button>
          <Button action='primary' isDisabled={!picked} onPress={confirm}>
            <ButtonText>Validate</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
