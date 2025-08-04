const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const protect = require("../middleware/auth");
const calculateScore = require("../utils/Calculate_Score");
const agenda = require('../jobs/agenda');

router.post("/", protect, async (req, res) => {
    const { title, description, deadline, importance, difficulty, completion, category, notifiedBeforeDeadline } = req.body;
    try {
        const task = new Task({
            user: req.user,
            title,
            description,
            deadline,
            importance,
            difficulty,
            completion,
            category, // And we save it to the new Task object
            notifiedBeforeDeadline: false 
        });
        await task.save();
        // Schedule the job to send notification before the deadline
        const notificationTime = new Date(task.deadline.getTime() - 60 * 60 * 1000);
        if (notificationTime > new Date()) {
            await agenda.schedule(notificationTime, 'send task deadline notification', { taskId: task._id });
        }
        // Add score before sending back
        const scoredTask = { ...task.toObject(), score: calculateScore(task) };
        res.status(201).json(scoredTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create task", error: err.message });
    }
});

router.get("/", protect, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user });

        const scoredTasks = tasks.map(task => {
            const score = calculateScore(task);
            return { ...task.toObject(), score };
        });

        scoredTasks.sort((a, b) => b.score - a.score);

        res.json(scoredTasks);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
    }
});

router.put("/:id", protect, async (req, res) => {
    try {
        const { notifiedBeforeDeadline, ...updateFields } = req.body;
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user },
            req.body,
            { new: true, runValidators: true }
        );
        if (!task) return res.status(404).json({ message: "Task not found" });
        // Add score to updated task
        const scoredTask = { ...task.toObject(), score: calculateScore(task) };
        res.json(scoredTask);
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
