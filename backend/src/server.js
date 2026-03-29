import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { createServer } from "http";
import { socketConnectionHandler } from "./handlers/socketConnectionHandlers.js";
import { createSocketServer } from "./config/socket.js";

const server = createServer(app);
const io = createSocketServer(server);

socketConnectionHandler(io);

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log("server is running on port", port);
});
