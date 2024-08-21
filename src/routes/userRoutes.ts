import express, { Request, Response } from "express";
import {
  registerUser,
  authUser,
  getUserData,
  logout,
} from "../controllers/userController";
const router = express.Router();

router.post("/register", ...registerUser);
router.post("/login", authUser);
router.get("/logout", logout);
router.post("/getUserData", getUserData);

export default router;
