import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Card } from '@/components/ui/card';
import { Center } from "@/components/ui/center";
import { Music4Icon, Music2Icon, TriangleAlertIcon } from "lucide-react-native";
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';


interface Props {
  error: string | null
  text?: string
}

export default function ErrorScreen({ error, text = 'Please try again later.' }: Props) {
  return (
    <Center className="flex-1 p-24">
      <Card className="items-center rounded-xl">
        <HStack space="md" className="items-center mb-8">
          <Badge size='sm' action={"error"} className="rounded-full h-6">
            <BadgeIcon size="lg" as={TriangleAlertIcon} />
            <BadgeIcon size="lg" as={Music4Icon} />
          </Badge>
          <Heading className="text-red-700 text-center">There is a wrong note in your music room</Heading>
          <Badge size='sm' action={"error"} className="rounded-full h-6">
            <BadgeIcon size="lg" as={Music2Icon} />
            <BadgeIcon size="lg" as={TriangleAlertIcon} />
          </Badge>
        </HStack>
        <HStack space="md" className="items-start">
          <VStack className=''>
            <Text size="md" className="font-semibold">{error ? error : "Unknow error broke the music"}</Text>
            <Text size="md" className="text-secondary-700">{text}</Text>
          </VStack>
        </HStack>
      </Card>
    </Center>
  )
}
