import express, { Request, Response } from "express";
const router = express.Router();

router.get("/user", async (req: Request, res: Response) => {
  res.send({ msg: "Hello World" });
});

export default router;
