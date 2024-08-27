import { Router } from "express";
import protect from "../middleware/authMiddleware";
import { joinMatchmakingQueue } from "../controllers/battleController";
import { Server } from "socket.io";

const battleRoutes = (io: Server) => {
  const router = Router();

  router.post("/joinMatchMakingQueue", protect, joinMatchmakingQueue(io));

  return router;
};

export default battleRoutes;
