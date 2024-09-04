import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Redis from "ioredis";
import { Server } from "socket.io";
import { emitToUser } from "../utils/socketFunctions";
import { SocketEmitter } from "../sockets/SocketEnums";
import { v4 as uuidv4 } from "uuid";
import Match from "../models/Match";

//Monster type
type abilitiesType = {
  name: string;
  power: string;
  type: string;
  _id: string;
};

type monsterType = {
  _id: string;
  name: string;
  type: string;
  stats: statsType;
  abilities: abilitiesType[] | undefined;
};

export type statsType = {
  attack: Number;
  defense: Number;
  speed: Number;
  health: Number;
};

export type turnType = {
  playerId: string;
  action: string;
  damageDealt: number;
};

export type matchType = {
  matchId: string;
  players: {
    playerId: string;
    monster: monsterType;
    health: Number;
  }[];
  turns: turnType[];
  status: string;
};

// Initialize Redis client
const redis = new Redis();

redis.on("error", (err) => console.error("Redis client error", err));

redis.connect(() => {
  console.log("Connected to redis");
});

interface MatchmakingRequest extends Request {
  user: { _id: string; name: string; email: string };
}

export const joinMatchmakingQueue = (io: Server) =>
  expressAsyncHandler(async (req: MatchmakingRequest, res: Response) => {
    const { _id, name, email } = req.user;

    // Add user to the matchmaking queue with a timestamp
    await redis.zadd(
      "matchmakingQueue",
      Date.now(),
      JSON.stringify({ _id, name, email })
    );
    const queue = await redis.zrange("matchmakingQueue", 0, -1);
    console.log("Retrieved queue:", queue);

    res
      .status(200)
      .json({ message: "You have been added to the matchmaking queue" });
  });

export async function attemptMatchmaking(io: Server) {
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
    // io.to(player1._id).emit("match_found", player2);
    // io.to(player2._id).emit("match_found", player1);

    emitToUser(io, player1._id, SocketEmitter.Match_Found, player2);
    emitToUser(io, player2._id, SocketEmitter.Match_Found, player1);

    console.log(`Match found: ${player1.name} vs ${player2.name}`);
  }
}

export async function startBattle(
  io: Server,
  monster: monsterType,
  playerId: string
) {
  // Store the selected monster for the player in Redis
  const playerKey = `player_selection:${playerId}`;
  await redis.set(playerKey, JSON.stringify(monster));
  console.log("Selected Monster: ", monster);

  // Check if both players have selected their monsters
  const allPlayerKeys = await redis.keys("player_selection:*");
  if (allPlayerKeys.length === 2) {
    // Get both players' selections
    const playerSelections = await redis.mget(allPlayerKeys);
    const playerSelectionMap: { [key: string]: monsterType } = {};

    allPlayerKeys.forEach((key, index) => {
      const id = key.split(":")[1];
      playerSelectionMap[id] = JSON.parse(playerSelections[index] as string);
    });

    const opponentId = allPlayerKeys
      .find((key) => key !== playerKey)!
      .split(":")[1];

    // Generate a unique match ID
    const matchId = uuidv4();

    // Check if a match already exists in Redis
    const existingMatch = await redis.get(`match:${matchId}`);

    if (!existingMatch) {
      // Initialize the match data in Redis
      const matchData: matchType = {
        matchId,
        players: [
          {
            playerId,
            monster: playerSelectionMap[playerId],
            health: playerSelectionMap[playerId].stats.health,
          },
          {
            playerId: opponentId,
            monster: playerSelectionMap[opponentId],
            health: playerSelectionMap[opponentId].stats.health,
          },
        ],
        turns: [],
        status: "ongoing",
      };

      await redis.set(`match:${matchId}`, JSON.stringify(matchData));

      // Emit an event to both players with the selected monsters and match ID
      emitToUser(io, playerId, SocketEmitter.Start_Battle, {
        matchId,
        playerMonster: playerSelectionMap[playerId],
        opponentMonster: playerSelectionMap[opponentId],
      });

      emitToUser(io, opponentId, SocketEmitter.Start_Battle, {
        matchId,
        playerMonster: playerSelectionMap[opponentId],
        opponentMonster: playerSelectionMap[playerId],
      });

      // Create a new match and save it to the database for backup
      const newMatch = new Match({
        matchId, // Ensure you add matchId in the Match schema
        players: [
          {
            playerId,
            monster: playerSelectionMap[playerId],
            health: playerSelectionMap[playerId].stats.health,
          },
          {
            playerId: opponentId,
            monster: playerSelectionMap[opponentId],
            health: playerSelectionMap[opponentId].stats.health,
          },
        ],
      });

      await newMatch.save();

      // Reset the selections for the next battle
      await redis.del(allPlayerKeys);
    } else {
      console.log("Match already exists, skipping database save.");
    }
  }
}

export async function getMatchData(io: Server, playerId: string) {
  // Find the match that this player is a part of
  const allMatchKeys = await redis.keys("match:*");
  let matchData = null;

  for (const matchKey of allMatchKeys) {
    const data = JSON.parse(await redis.get(matchKey));
    if (data.players.some((p: any) => p.playerId === playerId)) {
      matchData = data;
      break;
    }
  }

  if (matchData) {
    // Emit the match data to the requesting player
    emitToUser(io, playerId, SocketEmitter.Match_Data, matchData);
  } else {
    // If no match data is found, send an error or empty response
    emitToUser(io, playerId, SocketEmitter.Match_Data, {
      error: "No match found for this player.",
    });
  }
}

// monster selection timer
export async function startCountdown(io: Server, playerId: string) {
  let countdown = 15;

  const countdownInterval = setInterval(async () => {
    countdown--;

    // Emit the countdown to the player's room (or to both players)
    emitToUser(
      io,
      playerId,
      SocketEmitter.Monster_Select_Countdown_Update,
      countdown
    );

    if (countdown <= 0) {
      clearInterval(countdownInterval);

      // After countdown ends, check if the battle can start
      // const allPlayerKeys = await redis.keys("player_selection:*");
      // if (allPlayerKeys.length === 2) {
      //   await startBattle(io, allPlayerKeys);
      // } else {
      //   console.log(
      //     "Time ran out before both players selected their monsters."
      //   );
      //   // Handle any fallback logic if needed
      // }
    }
  }, 1000);
}
