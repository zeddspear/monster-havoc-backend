import { Server } from "socket.io";
import { userSocketMap } from "../sockets/connSocket";

export function emitToUser(
  io: Server,
  userId: string,
  event: string,
  data: any
) {
  const socketId = userSocketMap.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  } else {
    console.log(`User with ID ${userId} is not connected.`);
  }
}
