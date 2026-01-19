export interface ErrorMessage {
  type: "error";
  message: string;
  timestamp?: string;
}

export interface SuccessMessage {
  type: string;
  [key: string]: unknown;
}

export function sendErrorMessage(socket: WebSocket, message: string): void {
  try {
    const errorMessage: ErrorMessage = {
      type: "error",
      message,
      timestamp: new Date().toISOString(),
    };
    socket.send(JSON.stringify(errorMessage));
  } catch (error) {
    console.error("ws: error sending error message:", error);
  }
}

export function sendSuccessMessage(
  socket: WebSocket,
  message: SuccessMessage,
): void {
  try {
    socket.send(JSON.stringify({
      ...message,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("ws: error sending success message:", error);
  }
}

export function sendMessage(
  socket: WebSocket,
  message: Record<string, unknown>,
): void {
  try {
    socket.send(JSON.stringify({
      ...message,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("ws: error sending message:", error);
  }
}
