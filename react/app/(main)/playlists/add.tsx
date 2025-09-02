import EditPlayListForm from "@/components/playlist/EditPlaylistForm";
import { PlaylistPayload } from "@/types/playlist";
import { router, useRouter } from 'expo-router';


export default function AddNewPlayList() {

  const router = useRouter()


  const onSubmit = (payload: PlaylistPayload) => {
    console.log("HERE IMPLEMENT POST NEW PLAYLIST TO BACK")
    console.log("payload : ", payload)

    if (router.canGoBack()) {
      router.push('../')
    }
  }

  return (
    <EditPlayListForm onSubmit={onSubmit} />
  );
}
