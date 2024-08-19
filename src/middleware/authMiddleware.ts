import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import User from "../models/User";
import { NextFunction, Request, Response } from "express";

// Extend the Request interface to include the user property
interface CustomRequest extends Request {
  user?: any; // Adjust the type based on your User model
}

const protect = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    let token;

    token = req.cookies.jwt;

    if (token) {
      try {
        const decoded: jwt.JwtPayload = jwt.verify(
          token,
          process.env.JWT_SECRET
        ) as jwt.JwtPayload;

        req.user = await User.findById(decoded.userID).select("-password");
        next();
      } catch (error) {
        res.status(401);
        throw new Error(error.message);
      }
    } else {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  }
);

export default protect;
