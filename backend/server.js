const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const agenda = require('./jobs/agenda');
require("dotenv").config();
const app = express();
console.log("MongoDB URI:", process.env.MONGO_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

connectDB();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/Task");
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Smart Task Organizer Backend is Running!");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 5000}`);
});
(async function () {
  await agenda.start();
  console.log("Agenda started");
})().catch(err => {
  console.error("Error starting agenda:", err);
});