const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  importance: { type: Number, min: 1, max: 4, default: 2 },
  difficulty: { type: Number, min: 1, max: 5, default: 3 },
  completion: { type: Number, min: 0, max: 100, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);
