import React, { createContext, useRef, useState } from "react";

export const MyStore = createContext();

const AppContext = ({ children }) => {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [targetId, setTargetId] = useState("");

  const remoteId = useRef(null);

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
      }}
    >
      {children}
    </MyStore.Provider>
  );
};

export default AppContext;
