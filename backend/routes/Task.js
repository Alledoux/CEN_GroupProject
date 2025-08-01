const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const protect = require("../middleware/auth");
const calculateScore = require("../utils/Calculate_Score");

router.post("/", protect, async (req, res) => {
    const { title, description, deadline, importance, difficulty, completion } = req.body;
    try {
        const task = new Task({
            user: req.user,
            title,
            description,
            deadline,
            importance,
            difficulty,
            completion
        });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create task", error: err.message });
    }
});

router.get("/", protect, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user });

        // Add a priority score to each task and sort them
        const scoredTasks = tasks.map(task => {
            const score = calculateScore(task);
            return { ...task.toObject(), score };
        });

        // Sort in descending order (highest score first)
        scoredTasks.sort((a, b) => b.score - a.score);

        res.json(scoredTasks);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
    }
});

router.put("/:id", protect, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user },
            req.body,
            { new: true, runValidators: true }
        );
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update task", error: err.message });
    }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user });
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete task", error: err.message });
    }
});

module.exports = router;
