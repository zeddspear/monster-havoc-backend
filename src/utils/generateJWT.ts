import jwt from "jsonwebtoken";
import { Response } from "express";
import { tokenUserType } from "../controllers/userController";

const generateToken = (res: Response, user: tokenUserType) => {
  const token = jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
