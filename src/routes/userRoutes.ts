import express, { Request, Response } from "express";
import {
  registerUser,
  authUser,
  getUserData,
  logout,
} from "../controllers/userController";
import protect from "../middleware/authMiddleware";
const router = express.Router();

router.post("/register", ...registerUser);
router.post("/login", authUser);
router.get("/logout", protect, logout);
router.get("/getUserData", protect, getUserData);

export default router;
