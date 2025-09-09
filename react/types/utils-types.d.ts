type ApiError = {
  message: string;
  status?: number;
};

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError }

type SwipeDirection = 'right' | 'left'

type Rank = 1 | 2 | 3;
