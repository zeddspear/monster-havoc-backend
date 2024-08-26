import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the abilities schema
const abilitySchema = new Schema({
  name: { type: String, required: true },
  power: { type: Number, required: true },
  type: { type: String, required: true },
});

// Define the main schema for the monster
const evolutionSchema = new Schema({
  monsterId: { type: Schema.Types.ObjectId, ref: "monsters", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  abilities: [abilitySchema],
  monsterLevel: { type: Number, required: true },
});

// Create the model based on the schema
const Evolution = mongoose.model("Evolution", evolutionSchema);

export default Evolution;
