import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import mongoose from "mongoose";
import Redis from "ioredis";

// Initialize Redis client
const redis = new Redis();

redis.on("error", (err) => console.error("Redis client error", err));

interface MatchmakingRequest extends Request {
  user: { _id: string };
}

export const joinMatchmakingQueue = expressAsyncHandler(
  async (req: MatchmakingRequest, res: Response) => {
    const userId = req.user._id;

    // Add user to the matchmaking queue with a timestamp
    await redis.zadd("matchmakingQueue", Date.now(), userId);

    // Retrieve and log the current matchmaking queue
    const queue = await redis.zrange("matchmakingQueue", 0, -1, "WITHSCORES");
    console.log("Current Matchmaking Queue:", queue);

    res
      .status(200)
      .json({ message: "You have been added to the matchmaking queue" });
  }
);
