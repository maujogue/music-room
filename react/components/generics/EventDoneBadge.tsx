import { Badge, BadgeIcon } from '@/components/ui/badge';
import { BadgeCheck } from 'lucide-react-native';

type Props = {
  light?: boolean;
};

export default function EventDoneBadge({ light = false }: Props) {
  const classAdd = () => {
    return `p-0 items-center justify-center rounded-full h-10 w-10 border ${light ? 'bg-white/30 border-white/40' : 'bg-neutral-950/30 border-emerald-200'}`;
  };

  const textAdd = () => {
    return `h-7 w-7 ${light ? 'text-neutral-950' : 'text-emerald-200'}`;
  };

  return (
    <Badge className={classAdd()}>
      <BadgeIcon as={BadgeCheck} className={textAdd()} />
    </Badge>
  );
}
