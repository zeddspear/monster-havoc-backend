import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Monster from "../models/Monster";

export const getAllMonsters = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const monsters = await Monster.find();
      if (monsters) {
        res.json({
          message: "Monsters Fetched Successfully",
          monsters: monsters,
        });
      } else {
        throw new Error("Error occured fetching monsters!");
      }
    } catch (error) {
      res.status(404).json(error);
    }
  }
);

export const getUserMonsters = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { userMonsters } = req.body;

    try {
      const availableMonsters = await Monster.find({
        _id: { $nin: userMonsters },
      });

      res.status(200).json(availableMonsters);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve monsters" });
    }
  }
);

export const addMonster = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { name, img, type, description, abilities, stats, evolution } =
      req.body;
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
