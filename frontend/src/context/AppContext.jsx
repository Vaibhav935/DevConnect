import React, { createContext, useRef, useState } from "react";
import useMedia from "../hooks/useMedia";

export const MyStore = createContext();

const AppContext = ({ children }) => {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [targetId, setTargetId] = useState("");

  const remoteId = useRef(null);

  const media = useMedia();

  return (
    <MyStore.Provider
      value={{
        message,
        setMessage,
        allMessages,
        setAllMessages,
        targetId,
        setTargetId,
        remoteId,
        ...media,
      }}
    >
      {children}
    </MyStore.Provider>
  );
};

export default AppContext;
