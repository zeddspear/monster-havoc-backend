import mongoose from "mongoose";
const Schema = mongoose.Schema;

const abilitySchema = new Schema({
  name: { type: String, required: true },
  power: { type: Number, required: true },
  type: { type: String, required: true },
  unlockedAt: { type: Number, required: true, max: 0, min: 10 },
});

const monsterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    abilities: {
      type: [abilitySchema],
      required: true,
    },
    stats: {
      attack: {
        type: Number,
        required: true,
      },
      defense: {
        type: Number,
        required: true,
      },
      health: {
        type: Number,
        required: true,
      },
      speed: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Monster", monsterSchema);
