import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

type Props = {
  onPress?: () => void;
  isLiked?: boolean;
};

export default function LikeButton({ onPress, isLiked }: Props) {
  const liked = useSharedValue(isLiked ? 1 : 0);

  const outlineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.CLAMP),
        },
      ],
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: liked.value,
        },
      ],
    };
  });

  const handlePress = () => {
    liked.value = withSpring(liked.value ? 0 : 1);
    if (onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
          },
          outlineStyle,
        ]}
      >
        <MaterialCommunityIcons
          name={'heart-outline'}
          size={32}
          color={'black'}
        />
      </Animated.View>

      <Animated.View
        style={[
          {
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
          },
          fillStyle,
        ]}
      >
        <MaterialCommunityIcons name={'heart'} size={32} color={'red'} />
      </Animated.View>
    </Pressable>
  );
}
