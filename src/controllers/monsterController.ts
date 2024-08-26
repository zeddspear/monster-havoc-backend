import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import mongoose from "mongoose";
import Monster from "../models/Monster";
import User from "../models/User";
import Evolution from "../models/Evolution";

// Extend the Request interface to include the user property
interface CustomRequest extends Request {
  user?: any; // Adjust the type based on your User model
}

export const getAllMonsters = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const monsters = await Monster.find();

      if (monsters.length > 0) {
        res.json({
          message: "Monsters Fetched Successfully",
          monsters: monsters,
        });
      } else {
        res.status(404).json({ message: "No monsters found!" });
      }
    } catch (error) {
      console.error("Error fetching monsters:", error);
      res.status(500).json({
        message: "Error occurred fetching monsters!",
        error: error.message,
      });
    }
  }
);

export const getUserMonsters = expressAsyncHandler(
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.user._id;

      // Fetch the user's evolutions and populate monster details
      const result = await User.aggregate([
        // Match the specific user by ID
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },

        // Lookup to get evolution documents
        {
          $lookup: {
            from: "evolutions", // collection name in MongoDB
            localField: "monsters", // This field should be an array of ObjectIds
            foreignField: "_id", // The field in the 'evolutions' collection to match with
            as: "evolutionDetails",
          },
        },

        // Unwind to deconstruct the evolutionDetails array
        { $unwind: "$evolutionDetails" },

        // Lookup to get the monster details from the Evolution documents
        {
          $lookup: {
            from: "monsters", // collection name in MongoDB
            localField: "evolutionDetails.monsterId", // This should be ObjectId
            foreignField: "_id", // The field in the 'monsters' collection to match with
            as: "monsterDetails",
          },
        },

        // Unwind to deconstruct the monsterDetails array
        { $unwind: "$monsterDetails" },

        // Project to include only the necessary fields
        {
          $project: {
            _id: 0,
            evolutionMonsters: {
              monster: "$monsterDetails",
              abilities: "$evolutionDetails.abilities",
              monsterLevel: "$evolutionDetails.monsterLevel",
            },
          },
        },
      ]);

      console.log(result, "result");

      const availableMonsters = result.length
        ? result.map((item) => item.evolutionMonsters)
        : [];
      res.status(200).json({ monsters: availableMonsters });
    } catch (error) {
      console.error("Error fetching user monsters:", error);
      res.status(500).json({ message: "Failed to retrieve monsters" });
    }
  }
);

export const addMonster = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { name, img, type, description, abilities, stats, evolution } =
      req.body.values;

    try {
      let newMonster = await Monster.create({
        name,
        img,
        type,
        evolution,
        description,
        abilities,
        stats,
      });
      if (newMonster) {
        res.status(200).json({ message: "Monster Added Successfully" });
      } else {
        throw new Error("Error occured adding Monster!");
      }
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

export const addUserMonster = expressAsyncHandler(
  async (req: CustomRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { monsterId } = req.body;
      const userId = req.user._id;

      // Fetch abilities
      const monstAbilities = await getAbilities(monsterId, 1);

      // Create new evolution
      const newEvolution = await Evolution.create(
        [
          {
            monsterId: monsterId,
            userId: userId,
            abilities: monstAbilities,
            monsterLevel: 1,
          },
        ],
        { session }
      );

      // Update the user's monsters array
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { monsters: newEvolution[0]._id } },
        { new: true, session }
      );

      if (!updatedUser) {
        throw new Error("User not found");
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: "Monster added successfully",
        monsters: updatedUser.monsters,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    }
  }
);

async function getAbilities(monsterId: string, monsterLvl: number) {
  try {
    // Perform aggregation to get filtered abilities
    const result = await Monster.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(monsterId) } }, // Match the monster by ID
      {
        $project: {
          abilities: {
            $filter: {
              input: "$abilities",
              as: "ability",
              cond: { $lte: ["$$ability.unlocksAt", monsterLvl] }, // Filter abilities where unlocksAt <= monsterLvl
            },
          },
        },
      },
    ]);

    if (result.length === 0) {
      throw new Error("Monster not found");
    }

    return result[0].abilities;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching abilities");
  }
}
