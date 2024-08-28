import { Server, Socket } from "socket.io";
import { attemptMatchmaking } from "../controllers/battleController";
import { emitToUser } from "../utils/socketFunctions";

export const userSocketMap = new Map<string, string>(); // Map<userId, socketId>

export function socketConnection(io: Server) {
  let playerSelections: any = {};

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

    socket.on("monster_selected", (monster, playerId) => {
      // Store the selected monster for the player
      console.log("Selected Monser: ", monster);
      playerSelections[playerId] = monster;

      // Check if both players have selected their monsters

      if (Object.keys(playerSelections).length === 2) {
        // Find the opponent's ID
        const opponentId = Object.keys(playerSelections).find(
          (id) => id !== playerId
        );

        console.log(
          playerSelections[playerId],
          playerSelections[opponentId],
          "Both Monsters"
        );

        // Emit an event to both players with the selected monsters

        emitToUser(io, playerId, "start_battle", {
          playerMonster: playerSelections[playerId],
          opponentMonster: playerSelections[opponentId],
        });

        emitToUser(io, opponentId, "start_battle", {
          playerMonster: playerSelections[opponentId],
          opponentMonster: playerSelections[playerId],
        });
        // io.to(playerId).emit("start_battle", {
        //   playerMonster: playerSelections[playerId],
        //   opponentMonster: playerSelections[opponentId],
        // });

        // io.to(opponentId).emit("start_battle", {
        //   playerMonster: playerSelections[opponentId],
        //   opponentMonster: playerSelections[playerId],
        // });

        // Reset the selections for the next battle
        playerSelections = {};
      }
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
