import { Badge, BadgeIcon } from '@/components/ui/badge';
import { Lock } from 'lucide-react-native';

export default function PrivateBadge() {
  return (
    <Badge className='rounded-full h-10 w-10 bg-white/30 border border-white/40'>
      <BadgeIcon as={Lock} className='h-6 w-6' />
    </Badge>
  );
}
