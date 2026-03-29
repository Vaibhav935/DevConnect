import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import useResizableHook from "./hooks/useResizableHook";
import { Mic, Video } from "lucide-react";

const App = () => {
  const {
    isDragging,
    leftWidth,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useResizableHook();

  const socket = useRef(null);

  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [socketId, setSocketId] = useState("");
  const [targetId, setTargetId] = useState("");

  const peerConnection = useRef(null);
  const remoteId = useRef(null);

  const [localVideoStream, setLocalVideoStream] = useState(null);
  const localVideoRef = useRef(null);

  const [remoteVideoStream, setRemoteVideoStream] = useState(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:3000");

    socket.current.on("connect", () => {
      // console.log("client --", socket.current.id);
      setSocketId(socket.current.id);
    });

    socket.current.on("reply", (data) => {
      setAllMessages((prev) => [
        ...prev,
        {
          ...data,
          isOwn: false,
        },
      ]);
    });

    //  ==================================== chat content here ======================================

    // this is another guy
    // step 4. offer dusre guy ko receive ho gaya
    socket.current.on("offer", async (data) => {
      remoteId.current = data.sender;

      // step 13 part 2 - track set krna for remote pc
      // this is imp to set media on track on remote peer
      let streams = localVideoStream;

      if (!localVideoStream) {
        streams = await getUserMedia();
      }

      setUpPC();

      streams
        .getTracks()
        .forEach((track) => peerConnection.current.addTrack(track, streams));

      await peerConnection.current.setRemoteDescription(data.offer);

      // step 5 => ab ans create krna hai
      const answer = await peerConnection.current.createAnswer();

      // step 6 -> ans create ho gaya ab local desc set krna hai
      await peerConnection.current.setLocalDescription(answer);

      // step 7. -> Now send ans to first guy
      socket.current.emit("answer", {
        answer,
        targetId: data.sender,
      });
    });

    // this is now first gue
    // step 8 -- ab first guy received ans now set remote desc
    socket.current.on("answer", async (data) => {
      await peerConnection.current.setRemoteDescription(data.answer);
    });

    // this is now second guy
    // step 10 => now this is ice-candidate received from first guy
    socket.current.on("ice-candidate", async (data) => {
      console.log("inside ice-candidate");
      if (peerConnection.current && data.candidate) {
        try {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(data.candidate),
          );
          console.log("Ice candidate set successfull");
        } catch (error) {
          console.log("ice candidate not set not ready for connection");
        }

        //  after this all the process is done now browser will automatically do it for us
      }
    });

    socket.current.on("disconnect", (reason) => {
      console.log("disconnected: ", reason);
    });

    return () => {
      console.log("unmount");
      socket.current.disconnect();
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

  //  ==================================== chat content ended here ======================================

  // ============================ chat ended here ===============================================

  // ============================= Video things will start from here ================================

  const sendOffer = async () => {
    if (!targetId) throw new Error("Target Id is missing");

    remoteId.current = targetId;

    // step 13 part 1 -- track set krna for our pc
    // offer bhjne se phle media track me set krne ke liye this function is imp to call here
    let streams = localVideoStream;

    if (!localVideoStream) {
      streams = await getUserMedia();
    }

    setUpPC();

    streams
      .getTracks()
      .forEach((track) => peerConnection.current.addTrack(track, streams));

    // step 2 -> create an offer
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    // step 3 = offer create ho gaya ab send offer
    socket.current.emit("offer", {
      targetId,
      offer,
    });
  };

  const setUpPC = () => {
    // step 1 -> Initializing webRtc Object
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    //  ab ye step 8 ke bad hai
    // jab ice candidate mil jyga this will run automatically
    // step 9 --
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("ice-candidate", {
          targetId: remoteId.current,
          candidate: event.candidate,
        });
      }
    };

    //  step 12 - automatic after step 11
    // now after addTract,getTrack this will automatically fire and set remote media
    console.log("offer send");
    try {
      peerConnection.current.ontrack = (event) => {
        console.log("setting remote stream");
        setRemoteVideoStream(event.streams[0]);
        remoteVideoRef.current.srcObject = event.streams[0];
      };
    } catch (error) {
      console.log("error in setting remote vdo");
    }
  };

  //  step 11 -- Now first we will give permission to our camera first
  // Till now ice-candidate are set and exchanged now we need to add media on track
  let isCameraOn = false;
  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setLocalVideoStream(stream);
      localVideoRef.current.srcObject = stream;
      // setRemoteVideoStream(stream);
      // remoteVideoRef.current.srcObject = stream
      isCameraOn = true;

      // stream
      //   .getTracks()
      //   .forEach((track) => peerConnection.current.addTrack(track, stream));

      // here we are setting out media on track of ice-candidate
      return stream;
    } catch (error) {
      console.log("problem in getting media", error);
      alert("Problem in getting media");
    }
  };

  const toggleCamera = () => {
    const videoTrack = localVideoStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      videoTrack.stop();
      localVideoRef.current.srcObject = null;
      isCameraOn = false;
    }
  };

  const toggleMic = () => {};

  return (
    <>
      <div
        className="h-screen flex bg-[#c9c9c9] text-black select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Left Panel (Chat) */}
        <div style={{ width: leftWidth }} className=" p-3 min-w-80">
          <div className="border h-full rounded-2xl p-4 flex flex-col gap-2">
            <h2>
              User Id: <span className="select-all">{socketId}</span>
            </h2>
            <h4>{targetId}</h4>
            <div className="flex-1 border rounded-2xl p-4 flex flex-col gap-2 overflow-y-auto">
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
              className="w-full border px-4 py-1 rounded-2xl outline-none"
              onChange={(e) => setTargetId(e.target.value)}
              type="text"
              name="targetId"
              id="targetId"
              placeholder="Target Id"
            />
            <input
              className="w-full border px-4 py-1 rounded-2xl outline-none"
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
              onClick={isCameraOn ? toggleCamera : getUserMedia}
              className="bg-gray-400 rounded-2xl py-1 cursor-pointer text-black"
            >
              Get User Media
            </button>
          </div>
        </div>

        {/* Divider */}
        <div
          onMouseDown={handleMouseDown}
          className={`w-0.5 bg-gray-400 cursor-col-resize transition-all duration-100 ease-linear hover:w-1.5 hover:bg-orange-600 ${isDragging.current ? `bg-blue-500` : `bg-gray-400`}`}
        />

        {/* Right Panel (Video Call) */}
        <div className="flex-1 p-3 min-w-180">
          <div className="border h-full rounded-2xl p-4 flex flex-col gap-5">
            <div className="flex-1 relative">
              <div className="h-full border rounded-2xl p-2 ">
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
                  draggable="true"
                  className="h-full w-500 border rounded-2xl"
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                />
              </div>
            </div>
            <div className="border py-2 rounded-2xl flex items-center justify-center gap-5 ">
              <div
                onClick={toggleCamera}
                className="px-4 py-2 border cursor-pointer rounded-full"
              >
                <Video color="#000000" />
              </div>
              <div
                onClick={toggleMic}
                className="px-4 py-2 border cursor-pointer rounded-full"
              >
                <Mic color="#000000" />
              </div>
              <div className="px-4 py-2 border cursor-pointer rounded-full"></div>
              <div className="px-4 py-2 border cursor-pointer rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
