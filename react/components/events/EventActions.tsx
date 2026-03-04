import { useEffect, useState } from 'react';
import FloatButton from '@/components/generics/FloatButton';
import { Users, UserPlus, Play, LucideIcon } from 'lucide-react-native';
import EventMembersDrawer from './EventMembersDrawer';
import { useRouter } from 'expo-router';
import { usePlayer } from '@/contexts/PlayerCtx';
import Event3DotMenu from '@/components/events/eventDetail/EventDotMenu';
import ChooseDevice from '../player/ChooseDevice';

type Props = {
  displayInviteButton: boolean;
  eventId: string;
  eventData: MusicEventFetchResult;
  onUpdated?: () => void;
  className?: string;
  abovePlayer?: boolean;
  callDelete: () => void;
  callEdit: () => void;
};

// Vertical spacing between stacked float buttons (px)
const BUTTON_STEP = 60;

type ButtonDef =
  | {
      key: string;
      type: 'float';
      show: boolean;
      icon: LucideIcon;
      onPress: () => void;
    }
  | { key: string; type: 'menu'; show: boolean };

export default function EventActions({
  displayInviteButton,
  eventId,
  eventData,
  onUpdated,
  abovePlayer = false,
  callDelete,
  callEdit,
}: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { playTrack, tracksToPlay, setTracksToPlay } = usePlayer();
  const [showChooseDevice, setShowChooseDevice] = useState(false);
  const router = useRouter();

  const isOwner = eventData.user?.role === 'owner';

  useEffect(() => {
    const tracksIds = eventData.playlist.tracks.map(track => track.track_id);
    setTracksToPlay(tracksIds);
  }, []);

  const handleOpenInvite = () => {
    router.push(`(main)/events/${eventId}/invite`);
  };

  const baseBottom = abovePlayer ? 100 : 16;

  const buttonDefs: ButtonDef[] = [
    {
      key: 'members',
      type: 'float',
      show: displayInviteButton,
      icon: Users,
      onPress: () => setIsDrawerOpen(true),
    },
    {
      key: 'invite',
      type: 'float',
      show: displayInviteButton,
      icon: UserPlus,
      onPress: handleOpenInvite,
    },
    { key: 'menu', type: 'menu', show: true },
    {
      key: 'play',
      type: 'float',
      show: isOwner,
      icon: Play,
      onPress: () => setShowChooseDevice(true),
    },
  ];

  const visibleButtons = buttonDefs.filter(b => b.show);

  return (
    <>
      {visibleButtons.map((btn, index) => {
        const bottom = baseBottom + index * BUTTON_STEP;

        if (btn.type === 'menu') {
          return (
            <Event3DotMenu
              key={btn.key}
              callDelete={callDelete}
              callEdit={callEdit}
              eventData={eventData}
              isOwner={isOwner}
              className='absolute right-4 rounded-full p-4 blurred-bg'
              style={{ bottom }}
            />
          );
        }

        return (
          <FloatButton
            key={btn.key}
            icon={btn.icon}
            onPress={btn.onPress}
            className='absolute right-4 rounded-full p-4 blurred-bg'
            style={{ bottom }}
          />
        );
      })}

      <EventMembersDrawer
        eventData={eventData}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdated={onUpdated}
      />

      <ChooseDevice
        onClose={() => setShowChooseDevice(false)}
        show={showChooseDevice}
        onDeviceSelected={(deviceId?: string | null) => {
          if (!deviceId) return;
          playTrack(tracksToPlay, deviceId);
          setShowChooseDevice(false);
        }}
      />
    </>
  );
}
