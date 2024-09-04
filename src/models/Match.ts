import mongoose from "mongoose";
const Schema = mongoose.Schema;

const matchSchema = new Schema(
  {
    matchId: {
      type: String,
      required: true,
      unique: true,
    },
    players: [
      {
        playerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        monster: {
          type: Schema.Types.ObjectId,
          ref: "Monster",
          required: true,
        },
        health: { type: Number, required: true },
      },
    ],
    winner: { type: Schema.Types.ObjectId, ref: "User", required: false },
    turns: [
      {
        playerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, required: true },
        damageDealt: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;
