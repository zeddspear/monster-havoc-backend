import express, { Request, Response } from "express";
import {
  registerUser,
  authUser,
  getUserData,
} from "../controllers/userController";
const router = express.Router();

router.post("/register", ...registerUser);
router.post("/login", authUser);
router.post("/getUserData", getUserData);

export default router;
