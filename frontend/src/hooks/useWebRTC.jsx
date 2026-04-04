import React, { useContext, useEffect, useRef } from "react";
import useSocket from "./useSocket";
import { MyStore } from "../context/AppContext";

const useWebRTC = () => {
  const peerConnection = useRef(null);

  const remoteVideoRef = useRef(null);

  const { remoteId, targetId, localVideoStream, getMedia } =
    useContext(MyStore);
  const { socket } = useSocket();

  // step 1. Initialize WetRTC connection
  const setUpPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    // After offer and answer exchange, peers will start gathering ICE candidates
    // triggers automatically after setLocalDescription
    // step 9. Listen for ICE candidates from the remote peer
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("ice-candidate", {
          targetId: remoteId.current,
          candidate: event.candidate,
        });
      }
    };
    // ye hone ke bad connection establish ho jata hai and track event fire hota hai

    // step 12. Listen for remote media stream
    try {
      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          console.log("ontrack fired", event.streams);
          console.log("Remote stream received, setting video source...");
          //   remoteVideoRef.current.srcObject = event.streams[0];
          setTimeout(() => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
              console.log(event.streams[0].getTracks());
            }
          }, 0);
        }
      };
    } catch (error) {
      throw new Error("Error in setting remote stream");
    }
  };

  const sendOffer = async () => {
    if (!targetId) throw new Error("Target Id is missing");

    remoteId.current = targetId;

    // step 13 part 1 -track set krna for our pc
    // offer bhjne se phle media track me set krne ke liye this function is imp to call here
    let streams = localVideoStream;

    if (!localVideoStream) {
      if (typeof getMedia !== "function") {
        console.log("getMedia missing ❌");
        return;
      }
      streams = await getMedia();
    }

    if (!peerConnection.current) {
      setUpPeerConnection();
    }

    streams
      .getTracks()
      .forEach((track) => peerConnection.current.addTrack(track, streams));

    // step 2. Create an offer
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    // step 3. Send the offer to the remote peer using your signaling server
    socket.current.emit("offer", {
      targetId, // isko remoteId.current se replace krna hai aur randomize krna hai
      offer,
    });
  };

  // ========================================= useEffect =========================================

  useEffect(() => {
    // step 4. Listen for an offer from the remote peer - second guy ko offer receive ho gaya
    socket.current.on("offer", async (data) => {
      remoteId.current = data.sender;

      let streams = localVideoStream;

      if (!localVideoStream) {
        streams = await getMedia();
      }

      if (!peerConnection.current) {
        setUpPeerConnection();
      }

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
        targetId: data.sender,
        answer,
      });
    });

    // step 8. Listen for an answer from the remote peer - first guy ko ans receive ho gaya
    socket.current.on("answer", async (data) => {
      if (!peerConnection.current) return;
      // This check is important to ensure that first offer is set before setting remote description with answer
      if (
        peerConnection.current &&
        peerConnection.current.signalingState === "have-local-offer"
      ) {
        await peerConnection.current.setRemoteDescription(data.answer);
      }
    });

    // step 10. Now listen for ICE candidates from the remote peer - second guy again
    socket.current.on("ice-candidate", async (data) => {
      if (peerConnection.current && data.candidate) {
        try {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(data.candidate),
          );
        } catch (error) {
          console.log("Ice candidate not set, not ready for connection");
        }
      }
    });
    // ye hone ke bad connection establish ho jata hai and track event fire hota hai

    return () => {
      socket.current.off("offer");
      socket.current.off("answer");
      socket.current.off("ice-candidate");
    };
  }, []);

  return {
    remoteVideoRef,
    sendOffer,
  };
};

export default useWebRTC;
