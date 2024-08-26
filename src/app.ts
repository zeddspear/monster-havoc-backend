import express from "express";
import { configDotenv } from "dotenv";
import logger from "morgan";
import cors from "cors";
import connectToApp from "./config/starting";
import { errorHandler, notFound } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
//Importing Router
import userRouter from "./routes/userRoutes";
import monsterRouter from "./routes/monsterRoutes";
import battleRoutes from "./routes/battleRoutes";

configDotenv();

let app = express();

// connecting to app
connectToApp(app);

app.use(logger("dev"));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", userRouter);
app.use("/api", monsterRouter);
app.use("/api", battleRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
