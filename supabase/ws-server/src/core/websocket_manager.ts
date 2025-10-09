export function addClient(
    userId: string, ws: WebSocket, clientsByUser: Map<string, Set<WebSocket>>) {
  let s = clientsByUser.get(userId);
  if (!s) { s = new Set(); clientsByUser.set(userId, s); }
  s.add(ws);
}

export function removeClient(userId: string, ws: WebSocket, clientsByUser: Map<string, Set<WebSocket>>) {
  const s = clientsByUser.get(userId);
  if (!s) return;
  s.delete(ws);
  if (s.size === 0) clientsByUser.delete(userId);
}
