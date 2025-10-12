// Add a client WebSocket connection for a user
export function addClient(
  userId: string,
  ws: WebSocket,
  clientsByUser: Map<string, Set<WebSocket>>
): void {
  let userSockets = clientsByUser.get(userId);
  if (!userSockets) {
    userSockets = new Set();
    clientsByUser.set(userId, userSockets);
  }
  userSockets.add(ws);
  console.log(`ws: client added for user ${userId}. Total connections: ${userSockets.size}`);
}

// Remove a client WebSocket connection for a user
export function removeClient(
  userId: string,
  ws: WebSocket,
  clientsByUser: Map<string, Set<WebSocket>>
): void {
  const userSockets = clientsByUser.get(userId);
  if (!userSockets) return;

  userSockets.delete(ws);
  console.log(`ws: client removed for user ${userId}. Remaining connections: ${userSockets.size}`);

  if (userSockets.size === 0) {
    clientsByUser.delete(userId);
    console.log(`ws: all connections closed for user ${userId}`);
  }
}

// Get all connected clients for a user
export function getUserClients(
  userId: string,
  clientsByUser: Map<string, Set<WebSocket>>
): Set<WebSocket> | undefined {
  return clientsByUser.get(userId);
}

// Get total number of connected users
export function getTotalConnectedUsers(clientsByUser: Map<string, Set<WebSocket>>): number {
  return clientsByUser.size;
}

// Get total number of WebSocket connections
export function getTotalConnections(clientsByUser: Map<string, Set<WebSocket>>): number {
  let total = 0;
  for (const sockets of clientsByUser.values()) {
    total += sockets.size;
  }
  return total;
}
