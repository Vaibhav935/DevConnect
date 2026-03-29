import { chatEventHandler } from "./chatEventHandler";
import { webRTCHandler } from "./webRTCHandler";

export const socketConnectionHandler = (io) => {
  io.on("connection", (socket) => {
    chatEventHandler(socket);

    webRTCHandler(socket, io);
  });
};
