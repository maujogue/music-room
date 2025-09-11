type PlaylistSection = {
  title: string;
  data: SpotifyPlaylist[];
};

type PlaylistPayload = {
  name: string;
  public?: boolean;
  collaborative?: boolean;
  description?: string;
};
