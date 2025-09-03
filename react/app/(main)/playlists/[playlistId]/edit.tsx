import EditPlayListForm from "@/components/playlist/EditPlaylistForm";
import { useProfile } from "@/contexts/profileCtx";
import { PlaylistPayload } from "@/types/playlist";
import { SpotifyPlaylist } from "@/types/spotify";
import { apiFetch } from "@/utils/apiFetch";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlaylist } from "@/hooks/usePlaylist";
import { Center } from "@/components/ui/center/index";
import { Text } from "@/components/ui/text/index";


export default function EditPlayList() {

  const router = useRouter()
  const { profile } = useProfile();

  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { playlist, error: playlistError, loading } = usePlaylist(playlistId);

  const [formValues, setFormValues] = useState<Partial<PlaylistPayload>>({});
  const [apiError, setApiError] = useState<string>("");

  console.log(`Edit playlist call for playList '${playlistId}'`)

  useEffect(() => {
    if (playlist) {
      setFormValues({
        name: playlist.name,
        description: playlist.description ?? undefined,
        public: playlist.public ?? undefined,
        collaborative: playlist.collaborative ?? undefined,
      });
      console.log("SETTING INITIAL FORM VALUES")
      console.log("NAME : ", playlist.name)
    }
  }, [playlist, playlistId]);

  const onSubmit = async (payload: PlaylistPayload) => {

    console.log("HERE IMPLEMENT EDIT PLAYLIST TO BACK")
    console.log("payload : ", payload)

    if (!profile) {
      setApiError("Authentification error, try reconnect with Spotify please");
      return;
    }

    const resp: ApiResponse<SpotifyPlaylist> = await apiFetch<SpotifyPlaylist>(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${playlist?.id}`,
      {
        method: "PUT",
        body: payload,
      })

    if (!resp.success) {
      setApiError(resp.error ?? "Unknow API error");
      return;
    }

    if (router.canGoBack()) {
      router.push('../')
    }
  }

  if (!playlistId) {
    return <Center className="flex-1"><Text>No playlistId</Text></Center>;
  }

  if (!playlist) {
    return <Center className="flex-1"><Text>No playlist</Text></Center>;
  }

  if (loading || !formValues) {
    return (
      <Center className="flex-1">
        <Text>Loading playlist data param : {playlistId}</Text>
        <Text>playlistObjectID : {playlist?.id}</Text>
        <Text>loading state : {loading}</Text>
        <Text>formValues.name :  {formValues.name}</Text>
      </Center>);
  }

  if (playlistError) {
    return <Center className="flex-1"><Text>Loading playlist error : {playlistError}</Text></Center>;
  }

  return (
    <EditPlayListForm initialValues={formValues} onSubmit={onSubmit} ApiError={apiError} />
  );
}
