import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User";

export const registerUser = [
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
    body("name")
      .isLength({ min: 4 })
      .withMessage("Name must be at least 4 characters long"),
  ],
  expressAsyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, password } = req.body;
      const existUser = await User.findOne({ email });
      if (existUser) {
        res
          .status(400)
          .json({ message: "User alredy exists with this email!" });
      }
      const newUser = await User.create({
        name,
        email,
        password,
      });
      if (newUser) {
        res
          .status(201)
          .json({ success: true, message: "User created successfully!" });
      } else {
        res.status(400).json({ error: "Invalid user data" });
      }
    } catch (error) {
      res.json({ error: `Error occured while creating new user: ${error}` });
    }
  }),
];

export const authUser = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      //@ts-ignore
      if (user && (await user.checkPassword(password))) {
        res
          .status(201)
          .json({ id: user._id, email: user.email, name: user.name });
      } else {
        res.status(400).json({ error: "Email or Password is incorrect!" });
      }
    } catch (error) {
      res.json({ error: `Error occured while logging in: ${error}` });
    }
  }
);
