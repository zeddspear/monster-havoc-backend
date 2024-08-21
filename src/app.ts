import express from "express";
import { configDotenv } from "dotenv";
import logger from "morgan";
import cors from "cors";
import connectToApp from "./config/starting";
import { errorHandler, notFound } from "./middleware/errorHandler";
//Importing Router
import userRouter from "./routes/userRoutes";

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

app.use("/api/", userRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
