import { Router } from "express";
import protect from "../middleware/authMiddleware";
import { joinMatchmakingQueue } from "../controllers/battleController";
const router = Router();

router.post("/joinMatchMakingQueue", joinMatchmakingQueue);

export default router;
