import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import User from "../models/User";

// Extend the Request interface to include the user property
interface CustomRequest extends Request {
  user?: HydratedDocument<typeof User> | null; // Assuming you are using Mongoose for User model
}

const checkAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (req.user.name !== "admin") {
    return res.status(403).json({ message: "Only admin can access this API" });
  }

  next();
};

export default checkAdmin;
