import React, { useEffect, useRef, useState } from "react";
import { connectWS } from "../config/socket";

let socketInstance = null;
const getSocketInstance = () => {
  if (!socketInstance) {
    socketInstance = connectWS();
  }
  return socketInstance;
};

const useSocket = () => {
  const [socketId, setSocketId] = useState("");

  const socket = useRef(null);
  if (!socket.current) {
    socket.current = getSocketInstance();
  }

  useEffect(() => {
    socket.current.on("connect", () => {
      setSocketId(socket.current.id);
    });

    return () => {
      socket.current.off("connect");
    };
  }, [socket.current]);

  return {
    socket,
    socketId,
  };
};

export default useSocket;
