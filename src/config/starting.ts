import { Application } from "express";
import mongoose from "mongoose";
import { socketConnection } from "../sockets/connSocket";
import { Server } from "socket.io";
import http from "http";

export default async function connectToApp(
  app: Application,
  io: Server,
  server: http.Server
) {
  const port = process.env.PORT || 8200;

  const mongooseUri = process.env.MONGO_URI;

  try {
    const monConn = await mongoose.connect(mongooseUri, {
      dbName: "monster-havoc",
    });

    if (monConn.connection.readyState === 1) {
      // io.listen(Number(port));

      // app.listen(port, () =>
      //   console.log(
      //     `Your app with mongo connection is listening on port ${port}`
      //   )
      // );

      // Start the server
      server.listen(port, () =>
        console.log(
          `Your app with MongoDB connection is listening on port ${port}`
        )
      );

      //connecting to socket
      socketConnection(io);
    } else {
      throw new Error("An error occurred while connecting to mongodb");
    }
  } catch (error: any) {
    console.log("Connecting to db error: ", error);
  }
}
