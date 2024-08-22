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

    token = req.cookies?.jwt; // Ensure cookies are parsed

    if (token) {
      try {
        const decoded: jwt.JwtPayload = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as jwt.JwtPayload;

        req.user = await User.findById(decoded.userID).select("-password");

        if (!req.user) {
          res.status(401);
          throw new Error("User not found");
        }

        console.log("User", req.user);
        next();
      } catch (error) {
        res.status(401).json({
          message:
            error instanceof Error
              ? error.message
              : "Token verification failed",
        });
      }
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  }
);

export default protect;
