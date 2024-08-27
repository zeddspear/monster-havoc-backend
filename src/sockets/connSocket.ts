import { Server, Socket } from "socket.io";
import { attemptMatchmaking } from "../controllers/battleController";

export const userSocketMap = new Map<string, string>(); // Map<userId, socketId>

export function socketConnection(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    // this is not working
    socket.on("register_player", (playerId) => {
      console.log("PlayerID:", playerId);

      // Store the mapping of user ID to socket ID
      userSocketMap.set(playerId, socket.id);

      //   // Optionally, join a room with the user ID
      //   socket.join(playerId);
    });

    socket.on("attempt_matchmaking", async () => {
      await attemptMatchmaking(io);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      // Remove the user from the map
      for (const [userId, sockId] of userSocketMap.entries()) {
        if (sockId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });
}
