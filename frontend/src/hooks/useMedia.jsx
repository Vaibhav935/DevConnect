import React, { useRef, useState } from "react";

const useMedia = () => {
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const localVideoRef = useRef(null);

  const getMedia = async () => {
    if (localVideoStream) {
      console.log("Camera already active");
      return localVideoStream;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalVideoStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.log("Problem in getting media :: ", error);
      alert("Problem in getting media");
    }
  };

  const stopCamera = () => {
    if (localVideoStream) {
      console.log("Stopping camera...");

      // Sab tracks stop karo (video + audio)
      localVideoStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });

      // State clear karo
      setLocalVideoStream(null);

      // Video element clear karo
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }
  };

  return {
    localVideoStream,
    localVideoRef,
    getMedia,
    stopCamera,
  };
};

export default useMedia;
