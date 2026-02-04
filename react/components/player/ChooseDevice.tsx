import useGetDevice from '@/hooks/useChooseDevice';
import { Text, View } from 'react-native';
import { useEffect } from 'react';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/drawer';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from '@/components/ui/button';
import {
  RefreshCcw,
  LaptopMinimal,
  Smartphone,
  Speaker,
} from 'lucide-react-native';

interface ChooseDeviceProps {
  onClose: () => void;
  show: boolean;
  onDeviceSelected?: (deviceId: string | null) => void;
}

const ChooseDevice = ({
  onClose,
  show,
  onDeviceSelected,
}: ChooseDeviceProps) => {
  const { devices, loading, error, getDevice } = useGetDevice();

  useEffect(() => {
    if (show) {
      void getDevice();
    }
  }, [show, getDevice]);

  return (
    <Drawer isOpen={show} onClose={onClose}>
      <DrawerBackdrop />
      <DrawerContent className='w-full max-h-[60vh]'>
        <DrawerHeader className='flex-row justify-between items-center'>
          <Text style={{ fontWeight: '600', fontSize: 18 }}>
            Choose a Device
          </Text>
          <Button
            variant='link'
            onPress={() => void getDevice()}
            className='justify-start'
          >
            <RefreshCcw />
          </Button>
        </DrawerHeader>

        <DrawerBody>
          <VStack className='gap-3'>
            {loading && <Text>Loading devices...</Text>}
            {error && <Text>Error loading devices: {error.message}</Text>}

            {!loading && !error && devices.length === 0 && (
              <Text>
                Open Spotify (browser or application) to see your devices.
              </Text>
            )}

            {!loading &&
              !error &&
              devices.map(device => {
                const type = (device.type || '').toLowerCase();
                const isActive = !!device.is_active;
                const color = isActive ? '#16a34a' : '#374151';

                const Icon = () => {
                  if (type === 'smartphone')
                    return <Smartphone color={color} width={18} height={18} />;
                  if (type === 'computer')
                    return (
                      <LaptopMinimal color={color} width={18} height={18} />
                    );
                  return <Speaker color={color} width={18} height={18} />;
                };

                return (
                  <Button
                    key={device.id || device.name}
                    variant='link'
                    onPress={() =>
                      onDeviceSelected && onDeviceSelected(device.id)
                    }
                    className='justify-start'
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Icon />
                      <Text>
                        {device.name} {isActive ? '(Active)' : ''}
                      </Text>
                    </View>
                  </Button>
                );
              })}

            <Button
              variant='solid'
              action='secondary'
              onPress={onClose}
              className='mt-4 rounded-full'
            >
              <ButtonText>Close</ButtonText>
            </Button>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ChooseDevice;
