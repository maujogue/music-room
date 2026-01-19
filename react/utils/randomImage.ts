const images = [
  require('@/assets/default_playlist_img/abstract.jpg'),
  require('@/assets/default_playlist_img/cassette.jpg'),
  require('@/assets/default_playlist_img/headphone.jpg'),
  require('@/assets/default_playlist_img/images.jpg'),
  require('@/assets/default_playlist_img/objects.jpg'),
];

export const getRandomImage = () => {
  return images[Math.floor(Math.random() * images.length)];
};
