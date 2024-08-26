import { Server, Socket } from "socket.io";

export function socketConnection(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}