export type ApiError = {
  message: string;
  status?: number;
};

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError }

