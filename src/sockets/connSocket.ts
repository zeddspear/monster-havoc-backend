import { Server, Socket } from "socket.io";
import {
  attemptMatchmaking,
  monsterSelect,
  startCountdown,
} from "../controllers/battleController";
import { emitToUser } from "../utils/socketFunctions";

export const userSocketMap = new Map<string, string>(); // Map<userId, socketId>

export function socketConnection(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    socket.on("register_player", (playerId) => {
      // Store the mapping of user ID to socket ID
      userSocketMap.set(playerId, socket.id);

      //   // Optionally, join a room with the user ID
      //   socket.join(playerId);
    });

    socket.on("monster_selected", async (monster, playerId: string) => {
      await monsterSelect(io, monster, playerId);
    });

    socket.on("select_monster_countdown_start", async (playerId: string) => {
      // Start the countdown when a player joins the monster selection page
      await startCountdown(io, playerId);
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
