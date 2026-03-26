import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("socket client connected -- ", socket.id);

  socket.on("sender", (data) => {
    console.log("received data --", data);
    const { targetId, message } = data;

    data.isOwn = false;
    io.to(data.targetId).emit("reply", {
      message,
      id: socket.id,
    });
  });

  // got offer from first and sending it to second
  socket.on("offer", (data) => {
    io.to(data.targetId).emit("offer", {
      sender: socket.id,
      offer: data.offer
    })
  })

  // got answer from second and sending it to first
  socket.on("answer", (data) => {
    io.to(data.targetId).emit("answer", {
      answer: data.answer,
      sender: socket.id
    })
  })


  // got ice-candidate from the first guy not sending it to second guy
  socket.on("ice-candidate", (data) => {
    io.to(data.targetId).emit("ice-candidate", {
      sender: socket.id,
      candidate: data.candidate
    })
  })


});

server.listen(3000, () => {
  console.log("server is running on 3000");
});
