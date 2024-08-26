import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Redis from "ioredis";
import { Server } from "socket.io";

// Initialize Redis client
const redis = new Redis();

redis.on("error", (err) => console.error("Redis client error", err));

redis.connect(() => {
  console.log("Connected to redis");
});

interface MatchmakingRequest extends Request {
  user: { _id: string; name: string };
}

export const joinMatchmakingQueue = (io: Server) =>
  expressAsyncHandler(async (req: MatchmakingRequest, res: Response) => {
    const userId = req.user._id;
    const username = req.user.name;

    // Add user to the matchmaking queue with a timestamp
    await redis.zadd(
      "matchmakingQueue",
      Date.now(),
      JSON.stringify({ _id: userId, username })
    );

    // Try to find a match
    await attemptMatchmaking(io);

    res
      .status(200)
      .json({ message: "You have been added to the matchmaking queue" });
  });

async function attemptMatchmaking(io: Server) {
  // Retrieve the queue (all users sorted by join time)
  const queue = await redis.zrange("matchmakingQueue", 0, -1);

  if (queue.length >= 2) {
    // Pop the first two users from the queue
    const player1 = JSON.parse(queue[0]);
    const player2 = JSON.parse(queue[1]);

    // Remove them from the Redis queue
    await redis.zrem("matchmakingQueue", JSON.stringify(player1));
    await redis.zrem("matchmakingQueue", JSON.stringify(player2));

    // Notify both users via Socket.IO
    io.to(player1._id).emit("match_found", player2);
    io.to(player2._id).emit("match_found", player1);

    console.log(`Match found: ${player1.username} vs ${player2.username}`);
  }
}
