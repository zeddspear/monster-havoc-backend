import express, { Request, Response } from "express";
import {
  getAllMonsters,
  getUserMonsters,
  addMonster,
} from "../controllers/monsterController";
const router = express.Router();

router.get("/getAllMonsters", getAllMonsters);
router.post("/getUserMonsters", getUserMonsters);
router.post("/addMonster", addMonster);
export default router;
