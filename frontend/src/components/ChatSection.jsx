import { useContext } from "react";
import { MyStore } from "../context/AppContext";
import useResizableHook from "../hooks/useResizableHook";
import useChats from "../hooks/useChats";
import useSocket from "../hooks/useSocket";
import useWebRTC from "../hooks/useWebRTC";

const ChatSection = () => {
  const { setMessage, targetId, setTargetId, allMessages, getMedia } =
    useContext(MyStore);

  const { leftWidth } = useResizableHook();

  const { sendMessage } = useChats();
  const { socketId } = useSocket();
  const { sendOffer } = useWebRTC();

  return (
    <div style={{ width: leftWidth }} className=" p-3 min-w-80">
      <div className="border border-[#7F2CD4] h-full rounded-2xl p-4 flex flex-col gap-2">
        <h2 className="text-[#7F2CD4]">
          User Id: <span className="select-all">{socketId}</span>
        </h2>
        <h4>{targetId}</h4>
        <div className="flex-1 border border-[#7F2CD4] rounded-2xl p-4 flex flex-col gap-2 overflow-y-auto">
          {allMessages.map((c, idx) => {
            return (
              <div key={idx} className="flex">
                {c.isOwn ? (
                  <div className="flex justify-end w-full">
                    <p className="px-2 py-1 rounded bg-[#358a047b]">
                      {c.message}
                    </p>
                  </div>
                ) : (
                  <p className="px-2 py-1 rounded bg-[#bcbc027b]">
                    {c.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <input
          className="w-full border border-[#7F2CD4] px-4 py-1 rounded-2xl outline-none"
          onChange={(e) => setTargetId(e.target.value)}
          type="text"
          name="targetId"
          id="targetId"
          placeholder="Target Id"
        />
        <input
          className="w-full border  border-[#7F2CD4] px-4 py-1 rounded-2xl outline-none"
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          name="message"
          id="message"
          placeholder="Type here"
        />
        <button
          onClick={sendMessage}
          className="bg-gray-400 rounded-2xl py-1 cursor-pointer text-black"
        >
          Send
        </button>
        <button
          onClick={sendOffer}
          className="bg-gray-400 rounded-2xl py-1 cursor-pointer text-black"
        >
          Send Offer
        </button>
        <button
          onClick={getMedia}
          className="bg-gray-400 rounded-2xl py-1 cursor-pointer text-black"
        >
          Get User Media
        </button>
      </div>
    </div>
  );
};

export default ChatSection;
