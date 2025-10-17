type ApiError = {
  message: string;
  status?: number;
};

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

type SwipeDirection = 'right' | 'left';

type Rank = 1 | 2 | 3;

type LocationValue = { latitude: number; longitude: number; address?: string };

type PickedPlace = {
  latitude: number;
  longitude: number;
  address?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  country?: string;
};
