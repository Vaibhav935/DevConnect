import { chatEventHandler } from "./chatEventHandler.js";
import { webRTCHandler } from "./webRTCHandler.js";

export const socketConnectionHandler = (io) => {
  io.on("connection", (socket) => {
    chatEventHandler(socket);

    webRTCHandler(socket, io);
  });
};
