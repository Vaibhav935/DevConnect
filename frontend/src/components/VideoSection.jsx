import { Mic, Video } from "lucide-react";
import useMedia from "../hooks/useMedia";
import useWebRTC from "../hooks/useWebRTC";

const VideoSection = () => {
  const { localVideoRef } = useMedia();
  const { remoteVideoRef } = useWebRTC();

  return (
    <div className="flex-1 p-3 min-w-180">
      <div className="border h-full rounded-2xl p-4 flex flex-col gap-5">
        <div className="flex-1 relative">
          <div className="h-full border border-[#7F2CD4] rounded-2xl p-2 ">
            {/* Stranger Video */}
            <video
              className="border h-full w-full rounded-2xl border-red-600"
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />
          </div>
          <div className=" absolute right-5 bottom-5 rounded-2xl h-45 w-60 overflow-hidden  cursor-pointer">
            <video
              //   draggable="true"
              className="h-full w-500 border border-[#7F2CD4] rounded-2xl"
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
            />
          </div>
        </div>
        <div className="border border-[#7F2CD4] py-2 rounded-2xl flex items-center justify-center gap-5 ">
          <div
            // onClick={toggleCamera}
            className="px-4 py-2 border border-[#7F2CD4] cursor-pointer rounded-full"
          >
            <Video color="#000000" />
          </div>
          <div
            // onClick={toggleMic}
            className="px-4 py-2 border border-[#7F2CD4] cursor-pointer rounded-full"
          >
            <Mic color="#000000" />
          </div>
          <div className="px-4 py-2 border border-[#7F2CD4] cursor-pointer rounded-full"></div>
          <div className="px-4 py-2 border border-[#7F2CD4] cursor-pointer rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
