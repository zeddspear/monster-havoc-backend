import { Router } from "express";
import protect from "../middleware/authMiddleware";
import { joinMatchmakingQueue } from "../controllers/battleController";
const router = Router();

router.post("/joinMatchMakingQueue", protect, joinMatchmakingQueue);

export default router;
