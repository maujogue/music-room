import EventStateBadge from '@/components/generics/EventStateBadge';
import CollaborativeBadge from '@/components/generics/CollaborativeBadge';
import PrivateBadge from '@/components/generics/PrivateBadge';
import SpatioLicenceBadge from '@/components/generics/SpatioLicenceBadge';

type Props = {
  event: MusicEvent;
};

export default function EventAllBadges({ event }: Props) {
  return (
    <>
      <EventStateBadge event={event} />
      {event.spatio_licence && <SpatioLicenceBadge />}
      {event.is_private && <PrivateBadge />}
      {event.everyone_can_vote && <CollaborativeBadge />}
    </>
  );
}
