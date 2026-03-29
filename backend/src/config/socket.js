import { Server } from "socket.io";

export const createSocketServer = (server) => {
  return new Server(server, {
    cors: {
      origin: process.env.ORIGIN,
    },
  });
};
