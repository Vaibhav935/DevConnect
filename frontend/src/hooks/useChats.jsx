import React, { useContext, useEffect } from "react";
import { MyStore } from "../context/AppContext";
import useSocket from "./useSocket";

const useChats = () => {
  const { message, setAllMessages, targetId } = useContext(MyStore);

  const { socket } = useSocket();

  useEffect(() => {
    socket.current.on("reply", (data) => {
      setAllMessages((prev) => [
        ...prev,
        {
          ...data,
          isOwn: false,
        },
      ]);
    });

    return () => {
      socket.current.off("reply");
    };
  }, []);

  const sendMessage = () => {
    let data = {
      message,
      targetId,
      isOwn: true,
    };
    setAllMessages((prev) => [...prev, data]);
    socket.current.emit("sender", {
      message,
      targetId,
    });
  };
  return {
    sendMessage,
  };
};

export default useChats;
