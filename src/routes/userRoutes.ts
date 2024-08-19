import express, { Request, Response } from "express";
import { registerUser, authUser } from "../controllers/userController";
const router = express.Router();

router.post("/register", ...registerUser);
router.post("/login", authUser);

export default router;
