import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
});

export default mongoose.model("User", userSchema);
