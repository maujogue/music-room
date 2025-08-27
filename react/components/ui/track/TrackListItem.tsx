import { View, Text, StyleSheet, Image } from 'react-native';
import { SpotifyTrack } from '@/types/spotify';


type Props = {
  track: SpotifyTrack;
};

export default function TrackListItem({ track }: Props) {

  const getImage = () => {
    const hasValidImage =
      Array.isArray(track.album.images) &&
      track.album.images.length > 0 &&
      track.album.images[0]?.url;

    return { uri: hasValidImage ? track.album.images[0]!.url : 'https://picsum.photos/205' };
  };

  return (
    <View style={styles.container}>
        <Image
          source={getImage()}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{track.name}</Text>
          {track.artists && (
            <Text style={styles.owner}>By {track.artists[0].name}</Text>
          )}
        </View>
    </View>
  );
}

// TODO : USE tAILWIND COLORS + gLUE box text (fix glue version/import method)
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: '#154787',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.33,
    shadowRadius: 2.5,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#554787',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  owner: {
    fontSize: 12,
    color: '#ddd',
  },
});
