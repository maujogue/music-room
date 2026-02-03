import { useEffect, useState } from 'react';
import FloatButton from '@/components/generics/FloatButton';
import { Users, UserPlus, Play } from 'lucide-react-native';
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

  const onCloseChooseDevice = () => {
    setShowChooseDevice(false);
  };

  useEffect(() => {
    const tracksIds = eventData.playlist.tracks.map(track => track.track_id);
    setTracksToPlay(tracksIds);
  }, []);

  const handleOpenInvite = () => {
    router.push(`(main)/events/${eventId}/invite`);
  };

  return (
    <>
      {displayInviteButton && abovePlayer && (
        <>
          <FloatButton
            onPress={handleOpenInvite}
            icon={UserPlus}
            className={'absolute right-4 rounded-full p-4 blurred-bg'}
            style={{
              bottom: 160,
            }}
          />
          <FloatButton
            onPress={() => setIsDrawerOpen(true)}
            icon={Users}
            className={'absolute right-4 rounded-full p-4 blurred-bg'}
            style={{
              bottom: 100,
            }}
          />
        </>
      )}
      {displayInviteButton && !abovePlayer && (
        <>
          <FloatButton
            onPress={() => {
              console.log('open invite');
              handleOpenInvite();
            }}
            icon={UserPlus}
            className={'absolute bottom-20 right-4 rounded-full p-4 blurred-bg'}
          />
          <FloatButton
            onPress={() => setIsDrawerOpen(true)}
            icon={Users}
            className={'absolute bottom-4 right-4 rounded-full p-4 blurred-bg'}
          />
        </>
      )}
      {isOwner && abovePlayer && (
        <FloatButton
          onPress={() => setShowChooseDevice(true)}
          icon={Play}
          className={'absolute right-4 rounded-full p-4 blurred-bg'}
          style={{
            bottom: 280,
          }}
        />
      )}
      {isOwner && !abovePlayer && (
        <FloatButton
          onPress={() => {
            setShowChooseDevice(true);
          }}
          icon={Play}
          className={'absolute bottom-52 right-4 rounded-full p-4 blurred-bg'}
        />
      )}
      <EventMembersDrawer
        eventData={eventData}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdated={onUpdated}
      />
      {!abovePlayer ? (
        <Event3DotMenu
          callDelete={callDelete}
          callEdit={callEdit}
          eventData={eventData}
          isOwner={isOwner}
          className={'absolute right-4 bottom-36 rounded-full p-4 blurred-bg'}
        />
      ) : (
        <Event3DotMenu
          callDelete={callDelete}
          callEdit={callEdit}
          eventData={eventData}
          isOwner={isOwner}
          className={'absolute right-4 rounded-full p-4 blurred-bg'}
          style={{
            bottom: 220,
          }}
        />
      )}

      <ChooseDevice
        onClose={onCloseChooseDevice}
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
