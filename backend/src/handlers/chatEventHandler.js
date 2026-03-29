export const chatEventHandler = (socket) => {
  socket.on("sender", (data) => {
    console.log("received data --", data);
    const { targetId, message } = data;

    data.isOwn = false;
    io.to(targetId).emit("reply", {
      message,
      id: socket.id,
    });
  });
};
