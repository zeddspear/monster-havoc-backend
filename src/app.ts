import express from "express";
import { configDotenv } from "dotenv";
import logger from "morgan";
import connectToApp from "./config/starting";
//Importing Router
import userRouter from "./routes/userRoutes";

configDotenv();

let app = express();

// connecting to app
connectToApp(app);

app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/", userRouter);
