import express, { Request, Response } from "express";
import {
  getAllMonsters,
  getUserMonsters,
  addMonster,
} from "../controllers/monsterController";
import protect from "../middleware/authMiddleware";
import checkAdmin from "../middleware/checkAdmin";
const router = express.Router();

router.get("/getAllMonsters", getAllMonsters);
router.get("/getUserMonsters", protect, getUserMonsters);
router.post("/addMonster", protect, checkAdmin, addMonster);
export default router;
