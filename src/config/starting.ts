import { Application } from "express";
import mongoose from "mongoose";

export default async function connectToApp(app: Application) {
  const port = process.env.PORT || 8200;
  const mongooseUri = process.env.MONGO_URI;

  try {
    const monConn = await mongoose.connect(mongooseUri, {
      dbName: "monster-havoc",
    });

    if (monConn.connection.readyState === 1) {
      app.listen(port, () =>
        console.log(
          `Your app with mongo connection is listening on port ${port}`
        )
      );
    } else {
      throw new Error("An error occurred while connecting to mongodb");
    }
  } catch (error: any) {
    console.log("Connecting to db error: ", error);
  }
}
