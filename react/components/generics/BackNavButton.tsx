import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Button, ButtonIcon } from "@/components/ui/button";



export default function BackNavButton() {
  const router = useRouter();

  return (

     <Button
        size='lg'
        className='rounded-full bg-primary-500 w-10 h-10 p-1'
        action='primary'
        onPress={() => router.back()}
      >
        <ButtonIcon size='xl' className='w-8 h-8 text-sky-400' as={ArrowLeft} />
      </Button>
  );
}
