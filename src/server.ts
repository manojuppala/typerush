#!/usr/bin/env node

import { MultiplayerServer } from './multiplayer/server';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = new MultiplayerServer(port);

server.start().then(() => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║            TypeRush Multiplayer Server                        ║
╚════════════════════════════════════════════════════════════════╝

Server is running on port ${port}

Players can connect using this address in multiplayer mode.

Press Ctrl+C to stop the server.
  `);
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.stop();
  process.exit(0);
});
