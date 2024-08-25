import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import mongoose from "mongoose";
import Monster from "../models/Monster";
import User from "../models/User";

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
      const result = await User.aggregate([
        // Match the specific user by ID
        { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },

        // Perform a lookup to populate the monsters array
        {
          $lookup: {
            from: "monsters", // collection name in MongoDB
            localField: "monsters",
            foreignField: "_id",
            as: "populatedMonsters",
          },
        },

        // Project to include only the populatedMonsters array
        { $project: { populatedMonsters: 1, _id: 0 } },
      ]);

      const availableMonsters = result.length
        ? result[0].populatedMonsters
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
    try {
      const { monsterId } = req.body;

      // Update the user's monsters array by adding the monsterId
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { monsters: monsterId } }, // Add monsterId to the monsters array
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Monster added successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    }
  }
);
