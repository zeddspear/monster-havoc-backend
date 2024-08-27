import express from "express";
import { configDotenv } from "dotenv";
import logger from "morgan";
import cors from "cors";
import connectToApp from "./config/starting";
import { errorHandler, notFound } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
//Importing Router
import userRouter from "./routes/userRoutes";
import monsterRouter from "./routes/monsterRoutes";
import battleRoutes from "./routes/battleRoutes";

configDotenv();

let app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `${process.env.FRONTEND_URL}`,
    methods: ["GET", "POST"],
  },
});

// connecting to app
connectToApp(app, io, server);

app.use(logger("dev"));

app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", userRouter);
app.use("/api", monsterRouter);
app.use("/api", battleRoutes(io));

app.use(notFound);
app.use(errorHandler);

export default app;
