import { NextFunction } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const Schema = mongoose.Schema;

let userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    monsters: {
      type: Schema.Types.ObjectId,
      ref: "monsters",
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next: NextFunction) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.checkPassword = async function (enterdPassword: string) {
  return await bcrypt.compare(enterdPassword, this.password);
};
const User = mongoose.model("User", userSchema);

export default User;
