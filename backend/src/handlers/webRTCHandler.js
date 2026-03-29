export const webRTCHandler = (socket, io) => {
  // got offer from first and sending it to second
  socket.on("offer", (data) => {
    io.to(data.targetId).emit("offer", {
      sender: socket.id,
      offer: data.offer,
    });
  });

  // got answer from second and sending it to first
  socket.on("answer", (data) => {
    io.to(data.targetId).emit("answer", {
      answer: data.answer,
      sender: socket.id,
    });
  });

  // got ice-candidate from the first guy not sending it to second guy
  socket.on("ice-candidate", (data) => {
    io.to(data.targetId).emit("ice-candidate", {
      sender: socket.id,
      candidate: data.candidate,
    });
  });
};
