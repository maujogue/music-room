import abstractImg from '@/assets/default_playlist_img/abstract.jpg';
import cassetteImg from '@/assets/default_playlist_img/cassette.jpg';
import headphoneImg from '@/assets/default_playlist_img/headphone.jpg';
import imagesImg from '@/assets/default_playlist_img/images.jpg';
import objectsImg from '@/assets/default_playlist_img/objects.jpg';

const images = [abstractImg, cassetteImg, headphoneImg, imagesImg, objectsImg];

export const getRandomImage = () => {
  return images[Math.floor(Math.random() * images.length)];
};
