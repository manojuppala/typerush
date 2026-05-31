#!/usr/bin/env node

import { MultiplayerServer } from "./multiplayer/server";
import * as os from "os";

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = new MultiplayerServer(port);

// Get local network IP address
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (iface) {
      for (const alias of iface) {
        if (alias.family === "IPv4" && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return "localhost";
}

server
  .start()
  .then(() => {
    const localIP = getLocalIP();

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║            TypeRush Multiplayer Server                        ║
╚════════════════════════════════════════════════════════════════╝

Server is running on port ${port}

Connection addresses:
  • Same computer:        localhost:${port}
  • Local network (LAN):  ${localIP}:${port}

Share the LAN address with players on your WiFi/Ethernet network.
All players must use the same room name to join the same game.

Press Ctrl+C to stop the server.
  `);
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  server.stop();
  process.exit(0);
});
