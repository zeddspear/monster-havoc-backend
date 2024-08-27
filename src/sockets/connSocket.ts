import { Server, Socket } from "socket.io";

export function socketConnection(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    // this is not working
    socket.on("register_player", (playerId) => {
      console.log("PlayerID", playerId);
      socket.join(playerId);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}
