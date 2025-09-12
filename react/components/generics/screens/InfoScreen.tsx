import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { Center } from "@/components/ui/center";


interface Props {
  text: string
}

export default function InfoScreen({ text }: Props) {
  return (
    <Center className="flex-1">
      <HStack space="md" className="items-center">
        <Text size="md" className="capitalize">{text}</Text>
      </HStack>
    </Center>
  )
}
