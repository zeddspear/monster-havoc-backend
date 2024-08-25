import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User";
import generateToken from "../utils/generateJWT";
import { Types } from "mongoose";
interface CustomRequest extends Request {
  user?: tokenUserType; // Adjust the type based on your User model
}

export type tokenUserType = {
  _id: Types.ObjectId;
  name: string;
  email: string;
};

//Signup
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

//Login
export const authUser = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      //@ts-ignore
      if (user && (await user.checkPassword(password))) {
        const tokenUser = {
          _id: user._id,
          name: user.name,
          email: user.email,
        };
        generateToken(res, tokenUser as tokenUserType);
        res
          .status(201)
          .json({ _id: user._id, email: user.email, name: user.name });
      } else {
        // res.status(400).json({ error: "Email or Password is incorrect!" });
        throw new Error("Email or Password is incorrect!");
      }
    } catch (error) {
      res
        .status(400)
        .json({ error: `Error occured while logging in: ${error}` });
    }
  }
);

//Logout
export const logout = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Clear the authentication cookie
      res.clearCookie("jwt", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed", error: error.message });
    }
  }
);

//Get UserData

export const getUserData = expressAsyncHandler(
  async (req: CustomRequest, res: Response) => {
    try {
      if (req.user) {
        res.status(200).json({
          message: "User Data Fetched successfully",
          userData: req.user,
        });
      } else {
        throw new Error("Error occured finding user");
      }
    } catch (error) {
      res.status(400).json(error);
    }
  }
);
