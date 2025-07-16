const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  //before: user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  importance: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  completion: { type: Number, min: 0, max: 100, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);
