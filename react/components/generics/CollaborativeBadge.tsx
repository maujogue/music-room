import { Badge, BadgeIcon } from '@/components/ui/badge';
import { Aperture } from 'lucide-react-native';

export default function CollaborativeBadge() {
  return (
    <Badge className='rounded-full h-10 w-10'>
      <BadgeIcon as={Aperture} className='h-6 w-6' />
    </Badge>
  );
}
