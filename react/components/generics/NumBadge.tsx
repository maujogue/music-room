import { Badge, BadgeText } from '@/components/ui/badge';

interface Props {
  num: number;
  hideIfZero?:boolean;
}

export default function NumBadge({ num, hideIfZero = false }: Props) {

  if (hideIfZero && num == 0) { return null; }

  return (
    <Badge action="info" size='lg' className="rounded-2xl h-8">
      <BadgeText className='font-bold'>{num}</BadgeText>
    </Badge>
  )
}
