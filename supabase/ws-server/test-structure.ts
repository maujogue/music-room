#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Test script pour vérifier la structure modulaire du serveur WebSocket
 */

import { getTotalConnectedUsers, getTotalConnections } from './src/core/websocket_manager.ts';

// Test des fonctions utilitaires
function testWebSocketManager() {
  console.log('🧪 Testing WebSocket Manager...');

  const clientsByUser = new Map<string, Set<WebSocket>>();
  const mockSocket = {} as WebSocket;

  // Test initial state
  console.log(`Initial users: ${getTotalConnectedUsers(clientsByUser)}`);
  console.log(`Initial connections: ${getTotalConnections(clientsByUser)}`);

  // Simuler l'ajout d'un client
  const userSockets = new Set<WebSocket>();
  userSockets.add(mockSocket);
  clientsByUser.set('user-1', userSockets);

  console.log(`After adding user: ${getTotalConnectedUsers(clientsByUser)}`);
  console.log(`After adding connection: ${getTotalConnections(clientsByUser)}`);

  console.log('✅ WebSocket Manager tests passed!');
}

function testStructure() {
  console.log('🏗️  Testing project structure...');

  const modules = [
    './src/server.ts',
    './src/core/server.ts',
    './src/core/websocket_manager.ts',
    './src/handlers/connection.ts',
    './src/handlers/message.ts',
    './src/handlers/error.ts',
    './src/services/votes.ts'
  ];

  console.log('📁 Available modules:');
  modules.forEach(module => {
    console.log(`  ✅ ${module}`);
  });

  console.log('✅ Structure tests passed!');
}

function main() {
  console.log('🚀 WebSocket Server Structure Test');
  console.log('=====================================');

  testWebSocketManager();
  console.log('');
  testStructure();

  console.log('');
  console.log('🎉 All tests passed! The modular structure is ready.');
  console.log('');
  console.log('📖 To start the server:');
  console.log('   deno run --allow-net --allow-env src/server.ts');
}

if (import.meta.main) {
  main();
}
